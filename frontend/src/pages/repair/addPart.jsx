import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, DatePicker, Space } from 'antd';
import axios from 'axios';
import { domain } from '../../config';

const AddPartForm = () => {
    const [inputDate, setInputDate] = useState('');

    let user_type = localStorage.getItem('usertype');
    let permission = user_type && (user_type === "Owner" || user_type === "Service Writer");
    let constraint = new RegExp(/^[1-9]\d*$/, "g");
    let notification = 'Please enter number'

    const onFinish = async (values) => {
        if (inputDate === '') {
            message.info("Please pick the start date");
            return
        }
        let condition = { ...values, start_date: inputDate }
        console.log(condition);

        try {
            let resp = await axios.post(`${domain}repair/parts`, condition);
            if (resp.data['msg']) {
                message.warn(resp.data['msg']);
            } else {
                message.success("Parts Successfully Added");
            }
        } catch (err) {
            message.error("Add parts failed. Please try again.");
        }
    }

    return (
        permission ?
            <div>
                <div style={{ height: 40 }}></div>
                <Form labelCol={{ span: 4, }} wrapperCol={{ span: 8, }} onFinish={onFinish}>
                    <Form.Item label="Vin" name="vin" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item label="Start Date">
                        <Space direction="vertical">
                            <DatePicker onChange={(date, dateString) => setInputDate(dateString)} />
                        </Space>
                    </Form.Item>
                    <Form.Item label="Part Number" name="part_number" rules={[{ required: true, pattern: constraint, message: notification }]}><Input /></Form.Item>
                    <Form.Item label="Vendor Name" name="vendor_name" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item label="Price" name="price" rules={[{ required: true, pattern: constraint, message: notification }]}><Input /></Form.Item>
                    <Form.Item label="Quantity" name="quantity" rules={[{ required: true, pattern: constraint, message: notification }]}><Input /></Form.Item>
                    <Form.Item wrapperCol={{ offset: 4, span: 16, }}>
                        <Button type="primary" htmlType="submit">
                            Submit
                        </Button>
                    </Form.Item>
                </Form>
            </div>
            :
            <div>
                <h1>No Access to this page. Please login.</h1>
            </div>
    );
}

export default AddPartForm;