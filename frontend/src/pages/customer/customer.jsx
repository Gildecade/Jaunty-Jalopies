import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, message, Descriptions } from 'antd';
import { domain } from '../../config';

import axios from 'axios';

const { Option } = Select;

const Customer = () => {
  const [searchByTaxNumber, setSearchByTaxNumber] = useState(false);
  const [customerData, setCustomerData] = useState(null);


  const [form] = Form.useForm();

  const onFinish = async (values) => {
    const condition = searchByTaxNumber ? { tax_id_number: values.value } : { driver_license_number: values.value };
    
    try {
      const result = await axios.post(`${domain}customer/lookup`, condition);
      if (result.data.length === 0) {
        message.info("No customer found. Please try again.");
      } else {
        message.success("Successfully found customer.");
      }
      setCustomerData(result.data[0]);
    } catch(err) {
      message.error("Internal error. Try again");
    }
  }

  return (
    sessionStorage.getItem('usertype') ?
    <div>
      <h1>Lookup Customer</h1>  
      <Form
        layout='inline'
        form={form}
        onFinish={onFinish}
      >
        <Select defaultValue="driver_license_number" style={{ width: 300 }} onChange={() => setSearchByTaxNumber(!searchByTaxNumber)}>
          <Option value="driver_license_number">Lookup by Driver License Number</Option>
          <Option value="tax_id_number">Lookup by Tax ID Number</Option>
        </Select>
        <div style={{ width: 20 }}></div>
        <Form.Item name="value" 
          rules={[ 
            { required: true,
              message: 'Input value cannot be empty!',
            },
          ]}>
          <Input placeholder={searchByTaxNumber ? "Please Input Tax ID Number" : "Please Input Driver License Number"} style={{ width: 300 }} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">Lookup</Button>
        </Form.Item>
      </Form>
      <div style={{height: 40}}></div>
	
      { customerData ? 
        ( 
          <Descriptions title="Customer Info" bordered>
            <Descriptions.Item label="Customer ID">{customerData.id}</Descriptions.Item>
            <Descriptions.Item label="City">{customerData.city}</Descriptions.Item>
            <Descriptions.Item label="Postal Code">{customerData.postal_code}</Descriptions.Item>
            <Descriptions.Item label="State">{customerData.state}</Descriptions.Item>
            <Descriptions.Item label="Stree Address">{customerData.street_address}</Descriptions.Item>
            <Descriptions.Item label="Phone Number">{customerData.phone_number}</Descriptions.Item>
            <Descriptions.Item label="Email">{customerData.email}</Descriptions.Item>
          </Descriptions>
        ) : 
        (<div></div>)
      }
    </div>
    :
    <div>
      <h1>No Access to this page. Please login.</h1>
    </div>
  );
}


export default Customer;