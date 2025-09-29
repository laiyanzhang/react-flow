import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './index.module.less';
import memberIcon from '@/assets/images/memberIcon.png';

interface AgentListProps {
  targetId: number;
  agentList: Array<any>;
  onClick: (item: any) => void;
}

const AgentList: React.FC<AgentListProps> = ({ onClick, targetId, agentList }) => {
  const visibleCount = 6;
  const [currentPage, setCurrentPage] = useState(0);
  const [isHovered, setIsHovered] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setIsHovered(false)
    }, 1000)
  }, [])

  const totalPages = Math.ceil(agentList.length / visibleCount);

  const handlePrev = () => {
    setCurrentPage(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages - 1));
  };

  const canGoPrev = currentPage > 0;
  const canGoNext = currentPage < totalPages - 1;

  // 计算当前显示的项目
  const startIndex = currentPage * visibleCount;
  const visibleItems = agentList.slice(startIndex, startIndex + visibleCount);

  return (
    <div className={`${styles.agentList} ${isHovered ? styles.hovered : ''}`}>
      <div className={styles.triggerImage} onClick={() => setIsHovered(true)}></div>
      <div 
        className={styles.hoverContainer}
        style={{
          opacity: isHovered ? 1 : 0,
          transform: isHovered ? 'translateY(0)' : 'translateY(-20px)',
          pointerEvents: isHovered ? 'auto' : 'none'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setTimeout(() => { setIsHovered(false)}, 500)}
      >
        <div className={styles.container}>
          <button 
            className={`${styles.navButton} ${canGoPrev ? '' : styles.hidden}`}
            onClick={handlePrev}
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className={styles.content}>
            {visibleItems.map((item) => (
              <div 
                key={item.id}
                className={`${styles.item} ${item.id === targetId ? styles.selected : ''}`}
                onClick={() => onClick(item)}
              >
                <img src={item.avatarUrl || memberIcon} className={styles.img}></img>
                <div className={styles.name}>{item.name}</div>
              </div>
            ))}
          </div>
          
          <button 
            className={`${styles.navButton} ${canGoNext ? '' : styles.hidden}`}
            onClick={handleNext}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgentList;