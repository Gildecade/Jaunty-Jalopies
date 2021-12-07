import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message } from 'antd';
import { domain } from '../../config';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

import axios from 'axios';


const Authentication = () => {
  const [form] = Form.useForm();

  const [usertype, setUsertype] = useState(null);
  const [username, setUsername] = useState(null);

  useEffect(() => {
    const usertype = sessionStorage.getItem('usertype');
    const username = sessionStorage.getItem('username');
    setUsertype(usertype);
    setUsername(username);
  }, []);

  const login = async (values) => {
    try {
      const result = await axios.post(`${domain}`, {...values});
      if (!result.data || result.data.length === 0) {
        message.error("Wrong username or password. Please check agian.");
      } else {
        message.success(`Successfully logged in as ${result.data}`);
        sessionStorage.setItem("usertype", result.data);
        sessionStorage.setItem("username", values.username);
        setUsertype(result.data);
        setUsername(values.username);
      }
    } catch (err) {
      message.error("Internal error. Try again.");
      console.log(err);
    }
  };

  const logout = () => {
    message.success("Successfully logged out");
    sessionStorage.removeItem("usertype");
    sessionStorage.removeItem("username");
    setUsertype(null);
  }

  return (
    <div>
      { !usertype ? 
        (
          <div style={{marginLeft: '40px', marginTop: '18px'}}>
            <Form form={form} name="horizontal_login" layout="inline" onFinish={login}>
              <Form.Item
                name="username"
                rules={[{ required: true, message: 'Please input your username!' }]}
              >
                <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Username" />
              </Form.Item>
              <Form.Item
                name="password"
                rules={[{ required: true, message: 'Please input your password!' }]}
              >
                <Input
                  prefix={<LockOutlined className="site-form-item-icon" />}
                  type="password"
                  placeholder="Password"
                />
              </Form.Item>
              <Form.Item shouldUpdate>
                {() => (
                  <Button
                    type="primary"
                    htmlType="submit"
                  >
                    Log in
                  </Button>
                )}
              </Form.Item>
            </Form>
          </div>
        ) : 
        (
          <div style={{marginLeft: '40px',}}>
            <span>Welcome, {username}. Successfully logged in As {usertype} </span>
            <Button type="danger" onClick={logout}>Logout</Button>
          </div>
        )
      }
    </div>
  );
}

export default Authentication;
