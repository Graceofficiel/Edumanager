import React from 'react';
import { Moon, Sun, Palette, GripVertical } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const colors = [
  { name: 'indigo', primary: 'rgb(79, 70, 229)', secondary: 'rgb(59, 130, 246)' },
  { name: 'rose', primary: 'rgb(225, 29, 72)', secondary: 'rgb(244, 63, 94)' },
  { name: 'emerald', primary: 'rgb(16, 185, 129)', secondary: 'rgb(5, 150, 105)' },
  { name: 'amber', primary: 'rgb(245, 158, 11)', secondary: 'rgb(217, 119, 6)' },
];

export default function ThemeCustomizer() {
  const { theme, setTheme } = useTheme();
  const [isDragging, setIsDragging] = React.useState(false);
  const [position, setPosition] = React.useState<{ x: number | null, y: number | null }>({ x: null, y: null });
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });
  const [isCollapsed, setIsCollapsed] = React.useState(window.innerWidth < 640);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.drag-handle')) {
      setIsDragging(true);
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      setDragStart({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = Math.min(Math.max(0, e.clientX - dragStart.x), window.innerWidth - 250);
        const newY = Math.min(Math.max(0, e.clientY - dragStart.y), window.innerHeight - 200);
        setPosition({ x: newX, y: newY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const handleResize = () => {
      setIsCollapsed(window.innerWidth < 640);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('resize', handleResize);
    };
  }, [isDragging, dragStart]);

  const style: React.CSSProperties = {
    ...(position.x !== null && position.y !== null
      ? {
          left: position.x,
          top: position.y,
          right: 'auto',
          bottom: 'auto',
        }
      : {
          right: '1rem',
          bottom: '1rem',
        }),
  };

  return (
    <div
      className={`fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg select-none transition-all duration-200
        ${isDragging ? 'cursor-grabbing' : ''}
        ${isCollapsed ? 'p-2' : 'p-4 space-y-4'}
      `}
      style={style}
      onMouseDown={handleMouseDown}
    >
      <div className="flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="drag-handle cursor-grab active:cursor-grabbing">
              <GripVertical className="h-5 w-5 text-gray-400" />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Theme</span>
          </div>
        )}
        <button
          onClick={() => {
            if (isCollapsed) {
              setIsCollapsed(false);
            } else {
              setTheme({ ...theme, isDark: !theme.isDark });
            }
          }}
          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          {theme.isDark ? (
            <Sun className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          ) : (
            <Moon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          )}
        </button>
      </div>

      {!isCollapsed && (
        <div className="space-y-2">
          <div className="flex items-center">
            <Palette className="h-4 w-4 mr-2 text-gray-600 dark:text-gray-300" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Colors</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {colors.map((color) => (
              <button
                key={color.name}
                onClick={() => setTheme({
                  ...theme,
                  primaryColor: color.name,
                  secondaryColor: color.name,
                })}
                className={`w-6 h-6 rounded-full border-2 ${
                  theme.primaryColor === color.name
                    ? 'border-gray-900 dark:border-white'
                    : 'border-transparent'
                }`}
                style={{ background: `linear-gradient(135deg, ${color.primary}, ${color.secondary})` }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}