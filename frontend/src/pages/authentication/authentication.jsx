import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, message, Descriptions } from 'antd';
import { domain } from '../../config';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

import axios from 'axios';


const Authentication = () => {
  const [form] = Form.useForm();

  const login = (values) => {
    console.log('Finish:', values);
  };

  return (
    <div>
      { !localStorage.getItem('userinfo') ? 
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
          <div>
            <span>Successfully logged in As {}</span>
            <Button type="primary">Logout</Button>
          </div>
        )
      }
    </div>
  );
}

export default Authentication;