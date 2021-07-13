import { useState } from 'react';
import { Popover } from 'antd';

import ChatBox from './chat-box';
import ChatContactBox from './chat-contact-box';

import './App.css';
import { Route } from 'react-router-dom';

function App() {
  const [visible, setVisible] = useState(true);

  return (
    <>
      <Route exact path="/">
        <Popover
          zIndex="1"
          placement="rightBottom"
          content={<ChatBox onClose={() => setVisible(false)} />}
          trigger="click"
          visible={visible}
        >
          <div className="app-feedback" onClick={() => setVisible(true)}>FeedBack</div>
        </Popover>
      </Route>

      <Route exact path="/contact">
        <ChatContactBox />
      </Route>
    </>
  );
}

export default App;
