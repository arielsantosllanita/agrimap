import cn from 'classnames';
import { MenuOutlined } from '@ant-design/icons';
import './styles.css';
import { useState } from 'react';

/**
 * @see https://www.upbeatcode.com/react/implement-floating-action-button-in-react/
 */
const FAB = ({ actions }) => {
  const [open, setOpen] = useState(false);
  const mouseEnter = () => setOpen(true);
  const mouseLeave = () => setOpen(false);

  return (
    <ul
      className={cn('fab-container', { open })}
      onMouseEnter={mouseEnter}
      onMouseLeave={mouseLeave}
    >
      <li className="fab-button">
        <MenuOutlined />
      </li>
      {actions.map((action, index) => (
        <li
          style={{ transitionDelay: `${index * 25}ms` }}
          className={cn('fab-action', { open })}
          key={action.label}
          onClick={action.onClick}
        >
          {action.icon}
          <span className="tooltip">{action.label}</span>
        </li>
      ))}
    </ul>
  );
};

export default FAB;
