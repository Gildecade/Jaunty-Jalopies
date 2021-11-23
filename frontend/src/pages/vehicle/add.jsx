import React, { useState, useEffect } from 'react';
import { Select, Form, Input, Button, message, DatePicker } from 'antd';
import axios from 'axios';
import { domain } from '../../config';
import { useParams } from 'react-router';

const { Option } = Select;

const Add = () => {

  const { vin, setVIN } = useState([]);
  const [isCar, setIsCar] = useState(true);
  const [ colors, setColors] = useState([]);
  const [ manufacturers, setManufacturers] = useState([]);


  useEffect(() => {
    const initialize = async () => {
      const colors = await axios.post(`${domain}vehicle/get_colors`);
      const manufacturers = await axios.post(`${domain}vehicle/get_manufacturers`);
      const data = colors.data.map(color => color.color);
      const data1 = manufacturers.data.map(manufacturer => manufacturer.name);
      setColors(data);
      setManufacturers(data1);
    }
    const checkVIN = async() => {
      const vehicleRecord = await axios.post(`${domain}vehicle/add`);
      const vin = vehicleRecord.data.map(vin => vehicleRecord.vin);
      setVIN(vin);
    }
    initialize();
    checkVIN();
  });

  const onFinish = async (values) => {
    let condition = {};
    if (isCar) {
      condition = {...values, USERNAME: localStorage.getItem('usertype')};
    } else {
      condition = {...values, isBusiness: true};
    }
    console.log(condition);

    try {
      await axios.post(`${domain}vehicle/add`, condition);
      message.success("Customer Successfully Added");
    } catch(err) {
      message.error("Add customer failed. Please try again.");
    }
  }

  return (
    localStorage.getItem('usertype') ?
    <div>
      <Select defaultValue="isCar" style={{ width: 200 }} onChange={() => setIsCar(!isCar)}>
        <Option value="isCar">Add Individual</Option>
        <Option value="isBusiness">Add Business</Option>
      </Select>
      <div style={{height: 40}}></div>

      { isCar ? 
      (
      <Form onFinish={onFinish} labelCol={{ span: 4, }} wrapperCol={{ span: 8, }}>
        <Form.Item label="VIN" name="vin" rules={[{required: true}]}><Input /></Form.Item>
        <Form.Item label="Vehicle Type" name="vehicle_type" rules={[{required: true}]}>
          <Select placeholder="Select a option and change input text above">
            <Option value="car">Car</Option>
            <Option value="convertible">Convertible</Option>
            <Option value="truck">Truck</Option>
            <Option value="vanMinivan">Van/Minivan</Option>
            <Option value="suv">SUV</Option>
          </Select>
        </Form.Item>
        <Form.Item label="Color" name="color" rules={[{required: true}]}>
          <Select placeholder="Select a option and change input text above" allowClear>
            {colors.map(color => (
              <Option key={color}>{color}</Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="Manufacturer Name" name="manufacturer_name" rules={[{required: true}]}>
          <Select placeholder="Select a option and change input text above" allowClear>
            {manufacturers.map(manufacturer => (
              <Option key={manufacturer}>{manufacturer}</Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="Model Year" name="model_year" rules={[{required: true}]}><Input /></Form.Item>
        <Form.Item label="Model Name" name="model_name" rules={[{required: true}]}><Input /></Form.Item>
        <Form.Item label="Added Date" name="current_date" rules={[{required: true}]}><DatePicker /></Form.Item>
        <Form.Item label="Invoice Price" name="invoice_price" rules={[{required: true}]}><Input /></Form.Item>
        <Form.Item label="Description" name="description" rules={[{required: true}]}><Input /></Form.Item>
        <Form.Item wrapperCol={{ offset: 4, span: 16, }}>
          <Button type="primary" htmlType="submit">Lookup</Button>
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

export default Add;