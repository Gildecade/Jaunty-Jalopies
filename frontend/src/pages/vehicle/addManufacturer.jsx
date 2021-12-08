import { Form, Input, Button, message } from 'antd';
import axios from 'axios';
import { domain } from '../../config';

const AddManufacturerForm = () => {
  const onFinish = async (values) => {
    console.log(values);
    try {
      const result = await axios.post(`${domain}vehicle/add_manufacturer`, values);
      message.success("Successfully added manufacturer.");
      console.log(result);
    } catch(err) {
      message.error("Add manufacturer failed. Please try again.");
      console.log(err);
    }
  }
  return (
    sessionStorage.getItem('usertype') === "Owner" || sessionStorage.getItem('usertype') === "Inventory Clerk" ?
    <Form onFinish={onFinish} labelCol={{ span: 4, }} wrapperCol={{ span: 8, }}>
        <Form.Item label="Manufacturer" name="manufacturer" rules={[{required: true}]}><Input /></Form.Item>
        <Form.Item wrapperCol={{ offset: 4, span: 16, }}>
          <Button type="primary" htmlType="submit">Submit</Button>
        </Form.Item>
    </Form>
    :
    <div>
      <h1>Add Manufactuer</h1>
      <h1>No Access to this page. Please login as Inventory Clerk or Owner.</h1>
    </div>
  );
}

export default AddManufacturerForm;