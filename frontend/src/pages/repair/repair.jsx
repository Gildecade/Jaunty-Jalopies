import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Table } from 'antd';
import { domain } from '../../config';

import axios from 'axios';

const { Column } = Table;

const Repair = () => {
    const [repairData, setRepairData] = useState(null);

    let user_type = sessionStorage.getItem('usertype');
    let permission = user_type && (user_type === "Owner" || user_type === "Service Writer");

    const [form] = Form.useForm();

    const onFinish = async (values) => {
        const condition = { vin: values.value };

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
            setRepairData(result.data);
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
                        <Button type="primary" htmlType="submit">Lookup</Button>
                    </Form.Item>
                </Form>
                <div style={{ height: 40 }}></div>

                {repairData ?
                    (
                        <Table dataSource={repairData} scroll={{ x: 'max-content' }}>
                            <Column title="VIN" dataIndex="vin" key="vin" />
                            <Column title="Start Date" dataIndex="start_date" key="start_date" />
                            <Column title="Complete Date" dataIndex="complete_date" key="complete_date" />
                            <Column title="Odometer" dataIndex="odometer" key="odometer" />
                            <Column title="Labor Charge" dataIndex="labor_charge" key="labor_charge" />
                            <Column title="Description" dataIndex="description" key="description" />
                            <Column title="Service Writer" dataIndex="service_writer_username" key="service_writer_username" />
                            <Column title="Customer ID" dataIndex="customer_id" key="customer_id" />
                            <Column title="Model Year" dataIndex="model_year" key="model_year" />
                            <Column title="Vehicle Type" dataIndex="vehicle_type" key="vehicle_type" />
                            <Column title="Manufacturer" dataIndex="manufacturer" key="manufacturer" />
                            <Column title="Color" dataIndex="color" key="color" />
                        </Table>
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


export default Repair;