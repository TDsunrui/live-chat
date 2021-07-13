import { useState } from 'react';
import { Popover } from 'antd';

import ChatBox from './chat-box';
import ChatAgentBox from './chat-agent-box';

import './App.css';
import { Route } from 'react-router-dom';

function App() {
  const [visible, setVisible] = useState(true);

  return (
    <>
      <Route exact path="/user/:uid">
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

      <Route exact path="/agent/:uid">
        <ChatAgentBox />
      </Route>
    </>
  );
}

export default App;
