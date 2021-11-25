import React, { useState, useEffect } from 'react';
import { Select, Form, Input, Button, message } from 'antd';
import axios from 'axios';
import { domain } from '../../config';

const { Option } = Select;

const AddCustomerForm = () => {

  const [isIndividual, setIsIndividual] = useState(true);

  useEffect(() => {
    // TODO: authentication
  });

  const onFinish = async (values) => {
    let condition = {};
    if (isIndividual) {
      condition = {...values, isIndividual: true};
    } else {
      condition = {...values, isBusiness: true};
    }
    console.log(condition);

    try {
      await axios.post(`${domain}customer/add`, condition);
      message.success("Customer Successfully Added");
    } catch(err) {
      message.error("Add customer failed. Please try again.");
    }
  }

  return (
    sessionStorage.getItem('usertype') ?
    <div>
      <Select defaultValue="isIndividual" style={{ width: 200 }} onChange={() => setIsIndividual(!isIndividual)}>
        <Option value="isIndividual">Add Individual</Option>
        <Option value="isBusiness">Add Business</Option>
      </Select>
      <div style={{height: 40}}></div>

      { isIndividual ? 
      (
        <Form labelCol={{ span: 4, }} wrapperCol={{ span: 8, }} onFinish={onFinish}>
          <Form.Item label="City" name="city" rules={[{required: true}]}><Input /></Form.Item>
          <Form.Item label="Postal Code" name="postal_code" rules={[{required: true}]}><Input /></Form.Item>
          <Form.Item label="State" name="state" rules={[{required: true}]}><Input /></Form.Item>
          <Form.Item label="Street Address" name="street_address" rules={[{required: true}]}><Input /></Form.Item>
          <Form.Item label="Phone Number" name="phone_number" rules={[{required: true}]}><Input /></Form.Item>
          <Form.Item label="Email" name="email" rules={[{required: true}]}><Input /></Form.Item>
          <Form.Item label="First Name" name="first_name" rules={[{required: true}]}><Input /></Form.Item>
          <Form.Item label="Last Name" name="last_name" rules={[{required: true}]}><Input /></Form.Item>
          <Form.Item label="Driver License Number" name="driver_license_number" rules={[{required: true}]}><Input /></Form.Item>
          <Form.Item wrapperCol={{ offset: 4, span: 16, }}>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      ) : 
      (
        <Form labelCol={{ span: 4, }} wrapperCol={{ span: 8, }} onFinish={onFinish}>
          <Form.Item label="City" name="city" rules={[{required: true}]}><Input /></Form.Item>
          <Form.Item label="Postal Code" name="postal_code" rules={[{required: true}]}><Input /></Form.Item>
          <Form.Item label="State" name="state" rules={[{required: true}]}><Input /></Form.Item>
          <Form.Item label="Street Address" name="street_address" rules={[{required: true}]}><Input /></Form.Item>
          <Form.Item label="Phone Number" name="phone_number" rules={[{required: true}]}><Input /></Form.Item>
          <Form.Item label="Email" name="email" rules={[{required: true}]}><Input /></Form.Item>
          <Form.Item label="Primary Contact Name" name="pirmary_contact_name" rules={[{required: true}]}><Input /></Form.Item>
          <Form.Item label="Primary Contact Title" name="pirmary_contact_title" rules={[{required: true}]}><Input /></Form.Item>
          <Form.Item label="Tax ID Number" name="tax_id_number" rules={[{required: true}]}><Input /></Form.Item>
          <Form.Item label="Business Name" name="business_name" rules={[{required: true}]}><Input /></Form.Item>
          <Form.Item wrapperCol={{ offset: 4, span: 16, }}>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      )
      }
    </div>
    :
    <div>
      <h1>No Access to this page. Please login.</h1>
    </div>
  );
}

export default AddCustomerForm;