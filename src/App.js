import { useState } from 'react';
import { Popover } from 'antd';

import ChatBox from './chat-box';

import './App.css';

function App() {
  const [visible, setVisible] = useState(true);
  //  sunrui

  return (
    <Popover
      zIndex="1"
      placement="leftBottom"
      content={<ChatBox onClose={() => setVisible(false)} />}
      trigger="click"
      visible={visible}
    >
      <div className="app-feedback" onClick={() => setVisible(true)}>FeedBack</div>
    </Popover>
  );
}

export default App;
