import React, { useState, useEffect } from 'react';
import { Select, Form, Input, Button, message, DatePicker, InputNumber } from 'antd';
import axios from 'axios';
import { domain } from '../../config';

const { Option } = Select;

const Add = () => {

  const [result, setResult] = useState(null);
  const [isCar, setIsCar] = useState(true);
  const [isConvertible, setIsConvertible] = useState(false);
  const [isTruck, setIsTruck] = useState(false);
  const [isVanMinivan, setIsVanMinivan] = useState(false);
  const [isSUV, setIsSUV] = useState(false);
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
    initialize();
  }, []);

  const onChange = ( value ) => {
    if (value == "car") {
      setIsCar(true);
      setIsConvertible(false);
      setIsTruck(false);
      setIsVanMinivan(false);
      setIsSUV(false);
    } 
    else if (value == "convertible") {
      setIsCar(false);
      setIsConvertible(true);
      setIsTruck(false);
      setIsVanMinivan(false);
      setIsSUV(false);
    }
    else if (value == "truck") {
      setIsCar(false);
      setIsConvertible(false);
      setIsTruck(true);
      setIsVanMinivan(false);
      setIsSUV(false);
    }
    else if (value == "suv") {
      setIsCar(false);
      setIsConvertible(false);
      setIsTruck(false);
      setIsVanMinivan(false);
      setIsSUV(true);
    }
    else {
      setIsCar(false);
      setIsConvertible(false);
      setIsTruck(false);
      setIsVanMinivan(true);
      setIsSUV(false);
    }
  }

  const onFinish = async (values) => {
    let condition = {};
    if (isCar) {
      condition = {...values, vehicle_type: "car", USERNAME: sessionStorage.getItem('username')};
    } 
    else if (isConvertible) {
      condition = {...values, vehicle_type: "convertible", USERNAME: sessionStorage.getItem('username')};
    } 
    else if (isTruck) {
      condition = {...values, vehicle_type: "truck", USERNAME: sessionStorage.getItem('username')};
    } 
    else if (isSUV) {
      condition = {...values, vehicle_type: "suv", USERNAME: sessionStorage.getItem('username')};
    } 
    else {
      condition = {...values, vehicle_type: "vanMinivan", USERNAME: sessionStorage.getItem('username')};
    }
    console.log(condition);

    try {
      const result = await axios.post(`${domain}vehicle/add`, condition);
      if (result.data.msg) {
        message.warn(result.data.msg);
      } else {
        message.success("Successfully added vehicle.");
        setResult(result.data);
        console.log(result);
      }
    } catch(err) {
      message.error("Add Vehicle failed. Please try again.");
    }
  }

  return (
    sessionStorage.getItem('usertype') ?
    <div>
      <Select placeholder="Select a option and change input text above" onChange={onChange}>
        <Option value="car">Car</Option>
        <Option value="convertible">Convertible</Option>
        <Option value="truck">Truck</Option>
        <Option value="vanMinivan">Van/Minivan</Option>
        <Option value="suv">SUV</Option>
      </Select>
      <div style={{height: 40}}></div>
      { isCar ?
      (
      <Form onFinish={onFinish} labelCol={{ span: 4, }} wrapperCol={{ span: 8, }}>
        <Form.Item label="VIN" name="vin" rules={[{required: true}]}><Input /></Form.Item>
        <Form.Item label="Color" name="color" rules={[{required: true}]}>
          <Select mode="multiple" placeholder="Select a option and change input text above" allowClear>
            {colors.map(color => (
              <Option key={color}>{color}</Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="Manufacturer" name="manufacturer_name" rules={[{required: true}]}>
          <Select placeholder="Select a option and change input text above" allowClear>
            {manufacturers.map(manufacturer => (
              <Option key={manufacturer}>{manufacturer}</Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="Model Year" name="model_year" rules={[{required: true}]}><InputNumber min={100} max={2022} /></Form.Item>
        <Form.Item label="Model Name" name="model_name" rules={[{required: true}]}><Input /></Form.Item>
        <Form.Item label="Added Date" name="current_date" rules={[{required: true}]}><DatePicker /></Form.Item>
        <Form.Item label="Invoice Price" name="invoice_price" rules={[{required: true}]}><Input /></Form.Item>
        <Form.Item label="Description" name="description" rules={[{required: true}]}><Input /></Form.Item>
        <Form.Item label="Number of Doors" name="number_of_doors" rules={[{required: true}]}><Input /></Form.Item>
        <Form.Item wrapperCol={{ offset: 4, span: 16, }}>
          <Button type="primary" htmlType="submit">Submit</Button>
        </Form.Item>
      </Form>
      ) :
      (<div></div>)}
      { isConvertible ?
      (
      <Form onFinish={onFinish} labelCol={{ span: 4, }} wrapperCol={{ span: 8, }}>
        <Form.Item label="VIN" name="vin" rules={[{required: true}]}><Input /></Form.Item>
        <Form.Item label="Color" name="color" rules={[{required: true}]}>
          <Select mode="multiple" placeholder="Select a option and change input text above" allowClear>
            {colors.map(color => (
              <Option key={color}>{color}</Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="Manufacturer" name="manufacturer_name" rules={[{required: true}]}>
          <Select placeholder="Select a option and change input text above" allowClear>
            {manufacturers.map(manufacturer => (
              <Option key={manufacturer}>{manufacturer}</Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="Model Year" name="model_year" rules={[{required: true}]}><InputNumber min={100} max={2022} /></Form.Item>
        <Form.Item label="Model Name" name="model_name" rules={[{required: true}]}><Input /></Form.Item>
        <Form.Item label="Added Date" name="current_date" rules={[{required: true}]}><DatePicker /></Form.Item>
        <Form.Item label="Invoice Price" name="invoice_price" rules={[{required: true}]}><Input /></Form.Item>
        <Form.Item label="Description" name="description" rules={[{required: true}]}><Input /></Form.Item>
        <Form.Item label="Roof Type" name="roof_type" rules={[{required: true}]}><Input /></Form.Item>
        <Form.Item label="Back Seat Count" name="back_seat_count" rules={[{required: true}]}><Input /></Form.Item>
        <Form.Item wrapperCol={{ offset: 4, span: 16, }}>
          <Button type="primary" htmlType="submit">Submit</Button>
        </Form.Item>
      </Form>
      ) :
      (<div></div>)
      }
      { isTruck ?
      (
      <Form onFinish={onFinish} labelCol={{ span: 4, }} wrapperCol={{ span: 8, }}>
        <Form.Item label="VIN" name="vin" rules={[{required: true}]}><Input /></Form.Item>
        <Form.Item label="Color" name="color" rules={[{required: true}]}>
          <Select mode="multiple" placeholder="Select a option and change input text above" allowClear>
            {colors.map(color => (
              <Option key={color}>{color}</Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="Manufacturer" name="manufacturer_name" rules={[{required: true}]}>
          <Select placeholder="Select a option and change input text above" allowClear>
            {manufacturers.map(manufacturer => (
              <Option key={manufacturer}>{manufacturer}</Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="Model Year" name="model_year" rules={[{required: true}]}><InputNumber min={100} max={2022} /></Form.Item>
        <Form.Item label="Model Name" name="model_name" rules={[{required: true}]}><Input /></Form.Item>
        <Form.Item label="Added Date" name="current_date" rules={[{required: true}]}><DatePicker /></Form.Item>
        <Form.Item label="Invoice Price" name="invoice_price" rules={[{required: true}]}><Input /></Form.Item>
        <Form.Item label="Description" name="description" rules={[{required: true}]}><Input /></Form.Item>
        <Form.Item label="Cargo Capacity" name="cargo_capacity" rules={[{required: true}]}><Input /></Form.Item>
        <Form.Item label="Cargo Cover Type" name="cargo_cover_type" rules={[{required: true}]}><Input /></Form.Item>
        <Form.Item label="Number of Rear Axles" name="number_of_rear_axles" rules={[{required: true}]}><Input /></Form.Item>
        <Form.Item wrapperCol={{ offset: 4, span: 16, }}>
          <Button type="primary" htmlType="submit">Submit</Button>
        </Form.Item>
      </Form>
      ) :
      (<div></div>)
      }
      { isVanMinivan ?
      (
      <Form onFinish={onFinish} labelCol={{ span: 4, }} wrapperCol={{ span: 8, }}>
        <Form.Item label="VIN" name="vin" rules={[{required: true}]}><Input /></Form.Item>
        <Form.Item label="Color" name="color" rules={[{required: true}]}>
          <Select mode="multiple" placeholder="Select a option and change input text above" allowClear>
            {colors.map(color => (
              <Option key={color}>{color}</Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="Manufacturer" name="manufacturer_name" rules={[{required: true}]}>
          <Select placeholder="Select a option and change input text above" allowClear>
            {manufacturers.map(manufacturer => (
              <Option key={manufacturer}>{manufacturer}</Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="Model Year" name="model_year" rules={[{required: true}]}><InputNumber min={100} max={2022} /></Form.Item>
        <Form.Item label="Model Name" name="model_name" rules={[{required: true}]}><Input /></Form.Item>
        <Form.Item label="Added Date" name="current_date" rules={[{required: true}]}><DatePicker /></Form.Item>
        <Form.Item label="Invoice Price" name="invoice_price" rules={[{required: true}]}><Input /></Form.Item>
        <Form.Item label="Description" name="description" rules={[{required: true}]}><Input /></Form.Item>
        <Form.Item label="Has Drivers Side Back Door" name="has_drivers_side_back_door" rules={[{required: true}]}><Input /></Form.Item>  
        <Form.Item wrapperCol={{ offset: 4, span: 16, }}>
          <Button type="primary" htmlType="submit">Submit</Button>
        </Form.Item>
      </Form>
      ) :
      (<div></div>)
      }
      { isSUV ?
      (
      <Form onFinish={onFinish} labelCol={{ span: 4, }} wrapperCol={{ span: 8, }}>
        <Form.Item label="VIN" name="vin" rules={[{required: true}]}><Input /></Form.Item>
        <Form.Item label="Color" name="color" rules={[{required: true}]}>
          <Select mode="multiple" placeholder="Select a option and change input text above" allowClear>
            {colors.map(color => (
              <Option key={color}>{color}</Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="Manufacturer" name="manufacturer_name" rules={[{required: true}]}>
          <Select placeholder="Select a option and change input text above" allowClear>
            {manufacturers.map(manufacturer => (
              <Option key={manufacturer}>{manufacturer}</Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="Model Year" name="model_year" rules={[{required: true}]}><InputNumber min={100} max={2022} /></Form.Item>
        <Form.Item label="Model Name" name="model_name" rules={[{required: true}]}><Input /></Form.Item>
        <Form.Item label="Added Date" name="current_date" rules={[{required: true}]}><DatePicker /></Form.Item>
        <Form.Item label="Invoice Price" name="invoice_price" rules={[{required: true}]}><Input /></Form.Item>
        <Form.Item label="Description" name="description" rules={[{required: true}]}><Input /></Form.Item>
        <Form.Item label="Number of Cupholders" name="number_of_cupholders" rules={[{required: true}]}><Input /></Form.Item>
        <Form.Item label="Drivetrain Type" name="drivetrain_type" rules={[{required: true}]}><Input /></Form.Item>
        <Form.Item wrapperCol={{ offset: 4, span: 16, }}>
          <Button type="primary" htmlType="submit">Submit</Button>
        </Form.Item>
      </Form>
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

export default Add;