import React, { useState, useEffect } from 'react';
import { Table, Form, Input, Button, Select, message, Space, InputNumber } from 'antd';
import { domain } from '../../config';
import {
  Link
} from "react-router-dom";

import axios from 'axios';

const { Option } = Select;

const SearchVehicleForm = () => {
  const [result, setResult] = useState(null);
  const [ colors, setColors] = useState([]);
  const [ manufacturers, setManufacturers] = useState([]);

  const columns = [
    {
      title: "Vehicle VIN",
      dataIndex: "vin",
      key: "vin",
    },
    {
      title: "Vehicle Type",
      dataIndex: "vehicle_type",
      key: "vehicle_type",
    },
    {
      title: "Model Year",
      dataIndex: "model_year",
      key: "model_year",
    },
    {
      title: "Model Name",
      dataIndex: "model_name",
      key: "model_name",
    },
    {
      title: "Manufacturer",
      dataIndex: "manufacturer",
      key: "manufacturer",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Color",
      dataIndex: "color",
      key: "color",
    },
    {
      title: "Price",
      dataIndex: "list_price",
      key: "list_price",
    },
    {
      title: 'Action',
      key: 'action',
      render: (text, record) => (
        <Link to={`/vehicle/${record.vin}/${record.vehicle_type}`}>
          <Button type="link">View Details</Button>
        </Link>
      ),
    },
  ];

  const prefixSelector = (
    <Form.Item name="operand" noStyle>
      <Select style={{ width: 120 }}>
        <Option value="<">smaller than</Option>
        <Option value=">">greater than</Option>
      </Select>
    </Form.Item>
  );

  const [form] = Form.useForm();

  useEffect(() => {
    const initialize = async () => {
      const colors = await axios.post(`${domain}vehicle/get_colors`);
      const manufacturers = await axios.post(`${domain}vehicle/get_manufacturers`);
      const data = colors.data.map(color => color.color);
      const data1 = manufacturers.data.map(manufacturer => manufacturer.name);
      setColors(data);
      setManufacturers(data1);
    }
    initialize();
  }, []);

  const onFinish = async (values) => {
    console.log(values);
    try {
      const result = await axios.post(`${domain}vehicle/search`, {...values, USERNAME: sessionStorage.getItem('username')});
      if (result.data.msg) {
        message.info(result.data.msg);
      } else {
        message.success("Successfully found vehicle.");
        const data = result.data.map(f => {
          return {...f, key: f.vin};
        })
        setResult(data);
      }
      
    } catch(err) {
      message.error("Internal error. Try again");
    }
  }

  return (
    
    <div>
      <Form form={form} onFinish={onFinish} labelCol={{ span: 4, }} wrapperCol={{ span: 8, }}>
        { sessionStorage.getItem('usertype') ? 
          ( 
            <Form.Item label="VIN" name="vin" rules={[{required: false}]}><Input /></Form.Item>
          ) : 
          (<div></div>)
        }
        <Form.Item label="Vehicle Type" name="vehicle_type" rules={[{required: false}]}>
          <Select placeholder="Select a option and change input text above" allowClear>
            <Option value="car">Car</Option>
            <Option value="convertible">Convertible</Option>
            <Option value="truck">Truck</Option>
            <Option value="vanMinivan">Van/Minivan</Option>
            <Option value="suv">SUV</Option>
          </Select>
        </Form.Item>
        <Form.Item label="Color" name="color" rules={[{required: false}]}>
          <Select placeholder="Select a option and change input text above" allowClear>
            {colors.map(color => (
              <Option key={color}>{color}</Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="Manufacturer Name" name="manufacturer_name" rules={[{required: false}]}>
          <Select placeholder="Select a option and change input text above" allowClear>
            {manufacturers.map(manufacturer => (
              <Option key={manufacturer}>{manufacturer}</Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="Model Year" name="model_year" rules={[{required: false}]}><InputNumber min={100} max={2022} /></Form.Item>
        <Form.Item label="Price" name="list_price" rules={[{required: false}]}><Input addonBefore={prefixSelector} style={{ width: '100%' }} /></Form.Item>
        <Form.Item label="Key Word" name="key_word" rules={[{required: false}]}><Input /></Form.Item>
        <Form.Item wrapperCol={{ offset: 4, span: 16, }}>
          <Button type="primary" htmlType="submit">Lookup</Button>
        </Form.Item>
      </Form>
      <div style={{height: 40}}></div>
	
      { result ? 
        ( 
          <Table columns={columns} dataSource={result} />
        ) : 
        (<div></div>)
      }
    </div>

  );
}


export default SearchVehicleForm;