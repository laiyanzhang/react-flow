import { request } from '@/api/request';

interface StreamChatOptions {
  requestType: string; // 区分请求的接口
  onMessage: ({id, chunk} : { id: string, chunk: string }) => void;
  onComplete?: ({id, type} : { id: string, type: string }) => void;
  onError?: (error: Error) => void;
}

interface Params {
  model: string;
  id?: string | number;
  prompt: string;
}

/**
 * 使用 Fetch API + ReadableStream 进行流式聊天
 * @param params 接口传递参数
 * @param options 流处理选项
 * @returns 取消函数
 */
export const streamChatWithRequest = (
  params: Params,
  options: StreamChatOptions,
): (() => void) => {
  const { onMessage, onComplete, onError, requestType } = options;
  const controller = new AbortController();
  
  // 立即启动异步处理，但不等待它完成
  (async () => {
    try {
      let response:any
      if(requestType == 'openai'){
        response = await request('conversation/chat', params, {
          signal: controller.signal,
        });
      } else if(requestType == 'claude') {
        const finalParams = {
          ...params,
          model: "OpenRouter",
        }
        response = await request('conversation/chatWithOpenrouter', finalParams, {
          signal: controller.signal,
        });
      } else {
        response = await request('conversation/streamReplyFlux', params, {
          signal: controller.signal,
        });
      }
      
      if (!(response instanceof Response) || !response.body) {
        throw new Error('响应不支持流式读取');
      }
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let accumulatedData = '';
      let isFinished = false;
      let id = '';
      let type = '';
      
      try {
        // 读取流数据
        while (!isFinished) {
          // 检查是否已中止
          if (controller.signal.aborted) {
            break;
          }

          const { done, value } = await reader.read();
          
          if (done) {
            break;
          }
          
          // 解码接收到的数据
          const chunk = decoder.decode(value, { stream: true });
          
          accumulatedData += chunk;
          
          // 按行处理数据
          const lines = accumulatedData.split('\n');
          accumulatedData = lines.pop() || ''; // 保留最后一行未完成的数据
          
          for (const line of lines) {
            // 检查是否已中止
            if (controller.signal.aborted) {
              break;
            }
            
            const trimmedLine = line.trim();
            
            // 跳过空行和心跳信号
            if (trimmedLine === '' || trimmedLine === ':') {
              continue;
            }
            
            // 移除行首的 "data:" 前缀
            let message = trimmedLine;
            const dataPrefixRegex = /^data:\s*/;
            if (dataPrefixRegex.test(trimmedLine)) {
              message = trimmedLine.replace(dataPrefixRegex, '');
            }
            
            // 处理特殊标记如 [DONE]
            if (message === '[DONE]') {
              isFinished = true;
              break;
            }
            
            const data = JSON.parse(message)
            const content = data.choices[0].delta.content;
            id = data.conversationId;
            type = data.type;
            onMessage({
              chunk: content || '',
              id: id
            });
          }
        }
      } catch (readError: any) {
        // 专门处理读取过程中的错误
        if (readError.name === 'AbortError') {
          console.log('流读取已被中止');
          return;
        }
        throw readError;
      }
      
      // 处理剩余数据
      if (accumulatedData && !isFinished && !controller.signal.aborted) {
        const trimmedLine = accumulatedData.trim();
        if (trimmedLine && trimmedLine !== ':' && trimmedLine !== '[DONE]') {
          let message = trimmedLine;
          const dataPrefixRegex = /^data:\s*/;
          if (dataPrefixRegex.test(trimmedLine)) {
            message = trimmedLine.replace(dataPrefixRegex, '');
          }
          
          if (message !== '[DONE]') {
            console.log('最后剩余数据:', JSON.stringify(message));
            onMessage({
              chunk: message,
              id: id
            });
          }
        }
      }
      
      // 流完成
      if (onComplete && !controller.signal.aborted) {
        onComplete(
          {
            id,
            type
          }
        );
      }
    } catch (error: any) {
      if (error.status !== 'ECONNABORTED' && error.name !== 'AbortError' && onError) {
        onError(error);
      } else if (error.name === 'AbortError') {
        console.log('请求已被中止');
      }
    }
  })();
  
  // 立即返回取消函数
  return () => {
    console.log('调用中止');
    controller.abort();
  };
};