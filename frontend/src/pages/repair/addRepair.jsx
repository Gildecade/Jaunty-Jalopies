import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message } from 'antd';
import axios from 'axios';
import { domain } from '../../config';

const { TextArea } = Input;

const AddRepairForm = () => {

    let user_type = localStorage.getItem('usertype');
    let permission = user_type && (user_type === "Owner" || user_type === "Service Writer");

    const onFinish = async (values) => {
        if (!values.description) {
            values.description = '';
        }
        let condition = { ...values, USERNAME: localStorage.getItem('username') };
        console.log(condition);

        try {
            let resp = await axios.post(`${domain}repair/add`, condition);
            if (resp.data['msg']) {
                message.warn(resp.data['msg']);
            } else {
                message.success("Repair Successfully Added");
            }
        } catch (err) {
            message.error("Add repair failed. Please try again.");
        }
    }

    return (
        permission ?
            <div>
                <div style={{ height: 40 }}></div>
                <Form labelCol={{ span: 4, }} wrapperCol={{ span: 8, }} onFinish={onFinish}>
                    <Form.Item label="Vin" name="vin" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item label="Odometer" name="odometer" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item label="Customer ID" name="customer_id" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item label="Description" name="description"><TextArea rows={4} /></Form.Item>
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

export default AddRepairForm;