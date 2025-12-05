import './Skeleton.scss';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'circular' | 'rectangular';
  className?: string;
}

const Skeleton = ({ 
  width = '100%', 
  height = '1rem', 
  variant = 'text',
  className = '' 
}: SkeletonProps) => {
  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <div 
      className={`skeleton skeleton--${variant} ${className}`}
      style={style}
    />
  );
};

export const ChatSkeleton = () => {
  return (
    <div className="chat-skeleton">
      <div className="chat-skeleton__item">
        <Skeleton variant="circular" width={36} height={36} />
        <div className="chat-skeleton__content">
          <Skeleton width="40%" height={14} />
          <Skeleton width="90%" height={16} />
          <Skeleton width="75%" height={16} />
        </div>
      </div>
      <div className="chat-skeleton__item">
        <Skeleton variant="circular" width={36} height={36} />
        <div className="chat-skeleton__content">
          <Skeleton width="35%" height={14} />
          <Skeleton width="85%" height={16} />
          <Skeleton width="60%" height={16} />
          <Skeleton width="70%" height={16} />
        </div>
      </div>
    </div>
  );
};

export const SidebarSkeleton = () => {
  return (
    <div className="sidebar-skeleton">
      <Skeleton width="60%" height={12} className="sidebar-skeleton__title" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="sidebar-skeleton__item">
          <Skeleton variant="circular" width={18} height={18} />
          <Skeleton width="80%" height={14} />
        </div>
      ))}
      <Skeleton width="70%" height={12} className="sidebar-skeleton__title" />
      {[4, 5].map((i) => (
        <div key={i} className="sidebar-skeleton__item">
          <Skeleton variant="circular" width={18} height={18} />
          <Skeleton width="75%" height={14} />
        </div>
      ))}
    </div>
  );
};

export default Skeleton;

