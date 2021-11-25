import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Descriptions, DatePicker, Space } from 'antd';
import { domain } from '../../config';

import axios from 'axios';

const EditRepairForm = () => {
    const [vin, setVin] = useState(0);
    const [inputDate, setInputDate] = useState('');
    const [repairDetail, setRepairDetail] = useState(null);

    let user_type = sessionStorage.getItem('usertype');
    let permission = user_type && (user_type === "Owner" || user_type === "Service Writer");

    const [form] = Form.useForm();

    useEffect(() => {
        console.log(vin);
    }, [vin]);

    const onFinish = async (values) => {
        console.log('enter onfinish');
        if (inputDate === '') {
            message.info("Please pick the start date");
            return
        }
        const condition = { vin: values.value, start_date: inputDate, isEdit: true };
        setVin(values.value)

        try {
            const result = await axios.post(`${domain}repair/view`, condition);
            if (result.data.length === 0) {
                message.info("No repair data found. Please try again.");
            } else if (result.data['msg']) {
                message.warn(result.data['msg']);
            } else {
                message.success("Successfully found repair data.");
            }
            result.data.forEach(element => {
                element['start_date'] = JSON.stringify(element['start_date']).split("T")[0].substring(1);
                if (element['complete_date']) {
                    element['complete_date'] = JSON.stringify(element['complete_date']).split("T")[0].substring(1);
                }
            })
            setRepairDetail(result.data[0]);
        } catch (err) {
            message.error("Internal error. Try again");
        }
    }

    async function completeRepair() {
        let condition = { vin: vin, start_date: inputDate };
        try {
            const result = await axios.post(`${domain}repair/complete`, condition);
            if (result.data.length === 0) {
                message.info("No repair data found. Please try again.");
            } else if (result.data['msg']) {
                message.warn(result.data['msg']);
            } else {
                message.success("Successfully complete repair");
            }
        } catch (err) {
            console.log(err);
            message.error("Internal error. Try again");
        }
        return
    }

    const onEditFinish = async (values) => {
        if (!values.labor_charge) {
            message.warn("Please enter the new labor charge")
            return
        }
        let condition = { vin: vin, start_date: inputDate, USER_TYPE: user_type, labor_charge: values.labor_charge };
        console.log(condition);
        try {
            const result = await axios.post(`${domain}repair/edit`, condition);
            if (result.data.length === 0) {
                message.info("No repair data found. Please try again.");
            } else if (result.data['msg']) {
                message.warn(result.data['msg']);
            } else {
                message.success("Successfully update repair");
            }
        } catch (err) {
            message.error("Internal error. Try again");
        }
    }

    return (
        permission ?
            <div>
                <Form
                    layout='inline'
                    form={form}
                    onFinish={onFinish}
                >
                    <div style={{ width: 20 }}></div>
                    <Form.Item name="value"
                        rules={[
                            {
                                required: true,
                                message: 'Input value cannot be empty!',
                            },
                        ]}>
                        <Input placeholder={"Please Input VIN"} style={{ width: 300 }} />
                    </Form.Item>
                    <Form.Item>
                        <Space direction="vertical">
                            <DatePicker onChange={(date, dateString) => setInputDate(dateString)} />
                        </Space>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">Lookup</Button>
                    </Form.Item>
                </Form>
                <div style={{ height: 40 }}></div>

                {repairDetail ?
                    (
                        <div>
                            <Descriptions title="Repair Info" bordered>
                                <Descriptions.Item label="VIN">{repairDetail.vin}</Descriptions.Item>
                                <Descriptions.Item label="Start Date">{repairDetail.start_date}</Descriptions.Item>
                                <Descriptions.Item label="Complete Date">{repairDetail.complete_date}</Descriptions.Item>
                                <Descriptions.Item label="Odometer">{repairDetail.odometer}</Descriptions.Item>
                                <Descriptions.Item label="Labor Charge">{repairDetail.labor_charge}</Descriptions.Item>
                                <Descriptions.Item label="Description">{repairDetail.description}</Descriptions.Item>
                                <Descriptions.Item label="Service Writer">{repairDetail.service_writer_username}</Descriptions.Item>
                                <Descriptions.Item label="Customer ID">{repairDetail.customer_id}</Descriptions.Item>
                                <Descriptions.Item label="Model Year">{repairDetail.model_year}</Descriptions.Item>
                                <Descriptions.Item label="Vehicle Type">{repairDetail.vehicle_type}</Descriptions.Item>
                                <Descriptions.Item label="Manufacturer">{repairDetail.manufacturer}</Descriptions.Item>
                                <Descriptions.Item label="Color">{repairDetail.color}</Descriptions.Item>
                            </Descriptions>

                            <div style={{ height: 40 }}></div>
                            <Form labelCol={{ span: 2, }} wrapperCol={{ span: 8, }} onFinish={onEditFinish}>
                                <Form.Item label="Labor Charge" name="labor_charge"><Input /></Form.Item>
                                <Form.Item wrapperCol={{ offset: 2, span: 16, }}>
                                    <Button onClick={completeRepair}>
                                        Complete Repair
                                    </Button>
                                    <span>    </span>
                                    <Button htmlType="submit">
                                        Update
                                    </Button>
                                </Form.Item>
                            </Form>
                        </div>
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


export default EditRepairForm;