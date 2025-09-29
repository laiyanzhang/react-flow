import { Input, message } from 'antd';
import { useState, type ChangeEvent, useMemo } from 'react';
import styles from './components.module.less';
import { AtSign, X } from 'lucide-react';
import MediaPreview from '@/components/common/MediaPreview';
import UploadModal from '@/components/common/uploadModal';
import MediaGrid from './MediaGrid';
import { Dropdown, Tooltip, type MenuProps } from 'antd';
import { useChatStore } from '@/store/chatStore';
import memberIcon from '@/assets/images/memberIcon.png';
import MaterialSelectModal from '@/components/material/selectModal';

interface ChatInputProps {
  onStop: () => void;
  onChange: (value: string) => void;
  type: string; // 群组：AI_GROUP，员工：AI_STAFF
  targetName: string;
  isLoading: boolean;
  agentList: Array<any>;
  targetHeaderImage: string;
}

const { TextArea } = Input;

const ChatInput = ({
  onChange,
  onStop,
  type,
  isLoading,
  agentList,
  targetName,
  targetHeaderImage,
}: ChatInputProps) => {
  const [value, setValue] = useState('');
  const [employee, setEmployee] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string[]>([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string>('');
  const [uploadVisible, setUploadVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const { locked, uploadUrls } = useChatStore(state => state);
  const { setUploadUrls, setAgentType } = useChatStore(state => state.actions);

  const canUploadNumber = useMemo(() => {
    let maxNumber = 5;
    if (previewUrl.length > maxNumber) return 0;
    else return maxNumber - previewUrl.length;
  }, [previewUrl]);

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setValue(event.target.value);
  };
  const handleMediaClick = (index: number) => {
    setCurrentIndex(index);
    setPreviewVisible(true);
  };

  const handleDelete = (index: number) => {
    setPreviewUrl(prev => prev.filter((_, i) => i !== index));
    setUploadUrls(uploadUrls.filter((_, i) => i !== index));
  };
  const submitMessage = () => {
    if (locked) return;
    if (!value.trim()) {
      message.warning('发送内容不能为空');
      return;
    }
    const prefix = employee ? '@' + employee + ' ' : '';
    const suffix = previewUrl.length > 0 ? previewUrl.join('、') : '';
    const chatInfo = prefix + value + suffix;
    onChange(chatInfo);
    setPreviewUrl([]);
    setValue('');
    handleCancelSelect();
  };

  const handleCancelSelect = () => {
    setEmployee('');
    setSelectedKey('');
    setAgentType('');
  };

  const onClick: MenuProps['onClick'] = ({ key }) => {
    const selectedItem = agentList.find(item => item?.key == key);
    if (selectedItem && typeof selectedItem.label === 'string') {
      if (selectedKey === key) {
        handleCancelSelect();
      } else {
        setEmployee(selectedItem.label);
        setSelectedKey(key);
        setAgentType(selectedItem.agenttype);
      }
    }
  };
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      // 如果按下的是 Ctrl + Enter 或 Shift + Enter，则插入换行
      if (e.ctrlKey || e.shiftKey) {
        e.preventDefault();
        const textarea = e.target as HTMLTextAreaElement;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newValue =
          value.substring(0, start) + '\n' + value.substring(end);
        setValue(newValue);

        // 保持光标位置正确
        setTimeout(() => {
          textarea.selectionStart = start + 1;
          textarea.selectionEnd = start + 1;
        }, 0);
        return;
      }

      // 如果只是按下 Enter，则发送消息
      e.preventDefault();
      if (!isLoading) submitMessage();
    }
  };

  const handleUploadVisible = () => {
    if (canUploadNumber == 0) {
      message.warning('上传已达上限');
    } else {
      setUploadVisible(true);
    }
  };
  const handleModalVisible = () => {
    if (canUploadNumber == 0) {
      message.warning('上传已达上限');
    } else {
      setModalVisible(true);
    }
  };

  const handleClick = () => {
    submitMessage();
  };
  const handleOk = (urls: string[]) => {
    setUploadVisible(false);
    setPreviewUrl(prev => {
      return [...prev, ...urls];
    });
    setUploadUrls([...previewUrl, ...urls]);
  };
  const handleConfirm = (items: any[]) => {
    const urls = items.map(item => item.originUrl);
    setModalVisible(false);
    setPreviewUrl(prev => {
      return [...prev, ...urls];
    });
    setUploadUrls([...previewUrl, ...urls]);
  };
  return (
    <div className={styles.box}>
      <div className={styles.header}>
        <img src={targetHeaderImage} className={styles.img}></img>
        <div className={styles.title}>{targetName}</div>
      </div>
      <div className={styles.chatInput}>
        {type === 'AI_GROUP' && (
          <div className='flex items-center gap-2'>
            <Dropdown
              menu={{ items: agentList, onClick, selectedKeys: [selectedKey] }}
              placement='topLeft'
            >
              <div className={styles.at}>
                <AtSign size={16} color='#3d3d3d' />
              </div>
            </Dropdown>
            {employee && (
              <div className={styles.employeeContainer}>
                <div className={styles.employee}>{employee}</div>
                <div
                  className={styles.closeButton}
                  onClick={handleCancelSelect}
                >
                  <X size={10} color='#fff' />
                </div>
              </div>
            )}
          </div>
        )}
        <TextArea
          rows={3}
          style={{ resize: 'none', padding: '0', marginBottom: '8px' }}
          onChange={handleChange}
          onPressEnter={handleKeyPress}
          value={value}
          variant='borderless'
        />
        <MediaGrid
          urls={previewUrl}
          onMediaClick={handleMediaClick}
          onDelete={handleDelete}
        />
        <div className='flex justify-between items-center gap-4 mt-2'>
          <div>
            {type === 'AI_GROUP' && (
              <div className={styles.group}>
                <div className={styles.title}>AI员工</div>
                <div className={styles.divider}>|</div>
                <div className={styles.list}>
                  {agentList.map((item: any) => {
                    return (
                      <Tooltip title={item.label} key={item.key}>
                        <img
                          src={item.avatarurl || memberIcon}
                          className={styles.img}
                        ></img>
                      </Tooltip>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <div className={styles.operation}>
            <Tooltip title='从素材库上传'>
              <div
                className={`iconfont icon-folder-upload ${styles.uploadIcon}`}
                onClick={handleModalVisible}
              ></div>
            </Tooltip>
            <Tooltip title='从本地上传'>
              <div
                className={`iconfont icon-upload ${styles.uploadIcon}`}
                onClick={handleUploadVisible}
              ></div>
            </Tooltip>
            <div className={styles.divider}>|</div>
            {isLoading ? (
              <div className={styles.stopButton} onClick={() => onStop()}>
                <div
                  className={`${styles.icon} iconfont icon-termination`}
                ></div>
                <div>终止</div>
              </div>
            ) : (
              <div
                className={`${styles.sendButton} ${locked ? styles.locked : ''}`}
                onClick={handleClick}
              >
                <div className={`${styles.icon} iconfont icon-send`}></div>
                <div>发送</div>
              </div>
            )}
          </div>
        </div>
        <MediaPreview
          url={previewUrl}
          visible={previewVisible}
          onClose={() => setPreviewVisible(false)}
          initialIndex={currentIndex}
        />
        <UploadModal
          visible={uploadVisible}
          onCancel={() => setUploadVisible(false)}
          onOk={handleOk}
          title='上传视频文件'
          accept='video'
          maxCount={canUploadNumber}
          maxSize={200}
          multiple={true}
        />
        <MaterialSelectModal
          visible={modalVisible}
          onCancel={() => setModalVisible(false)}
          onConfirm={handleConfirm}
          title='选择素材文件'
          maxCount={5}
          allowedTypes={['VIDEO']}
        />
      </div>
    </div>
  );
};

export default ChatInput;
