import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, message, DatePicker, InputNumber } from 'antd';
import { domain } from '../../config';
import { useParams } from 'react-router-dom';
import axios from 'axios';


const { Option } = Select;

const SellVehicleForm = () => {

  const { vin } = useParams();
  const [ price, setPrice] = useState([]);
  const [ customers, setCustomers] = useState([]);
  const [ added_date, setAddedDate] = useState([]);


  const [form] = Form.useForm();

  useEffect(() => {
    const initialize = async () => {
      const price_result = await axios.post(`${domain}vehicle/get_price`, {vin: vin});
      const customers = await axios.post(`${domain}vehicle/get_customers`);
      const price = price_result.data.map(price => price.invoice_price)[0];
      const added_date = price_result.data.map(date => date.added_date.substring(0, 10))[0];
      const data = customers.data.map(customer => customer.id);
      setCustomers(data);
      setAddedDate(added_date);
      setPrice(price);
      console.log(added_date);
    }
    initialize();
  }, []);

  const onFinish = async (values) => {
    if ( sessionStorage.getItem('usertype') == 'Salespeople' && values.sold_price <= 0.95 * price) {
      message.warn("Sold price is too low!");
      return;
    }
    if (values.current_date.isBefore(added_date)) {
      message.warn("Sold date is before added date!");
      return;
    }
    console.log(values.current_date.isBefore(added_date));
    try {
      const result = await axios.post(`${domain}vehicle/sell`, {...values, vin: vin, USERNAME: sessionStorage.getItem('username')});
      if (result.data.msg) {
        message.info(result.data.msg);
      } else {
        message.success("Successfully sell vehicle.");
      }
      
    } catch(err) {
      message.error("Internal error. Try again");
    }
  }

  return (
    
    <div>
      <Form form={form} onFinish={onFinish} labelCol={{ span: 4, }} wrapperCol={{ span: 8, }}>
        <Form.Item label="VIN" name="vin" rules={[{required: false}]}><Input defaultValue={vin} disabled /></Form.Item>
        <Form.Item label="Added Date" name="added_date" rules={[{required: false}]}><Input defaultValue={added_date} disabled /></Form.Item>
        <Form.Item label="Sold Date" name="current_date" rules={[{required: true}]}><DatePicker /></Form.Item>
        <Form.Item label="Customer ID" name="customer_id" rules={[{required: true}]}>
          <Select placeholder="Select a option and change input text above" allowClear>
            {customers.map(customer => (
              <Option key={customer}>{customer}</Option>
            ))}
          </Select>  
        </Form.Item>
        <Form.Item label="Sold Price" name="sold_price" rules={[{required: true}]}><InputNumber min={0} /></Form.Item>
        <Form.Item wrapperCol={{ offset: 4, span: 16, }}>
          <Button type="primary" htmlType="submit">Submit</Button>
        </Form.Item>
      </Form>
      <div style={{height: 40}}></div>
	
    </div>

  );
}


export default SellVehicleForm;