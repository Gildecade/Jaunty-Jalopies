import React, { useState, useEffect } from 'react';
import { Table, message, Tag, Space } from 'antd';
import { domain } from '../../config';
import {
  Link
} from "react-router-dom";

import axios from 'axios';


const GrossCustomerIncome = () => {

  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await axios.post(`${domain}viewReport/grossCustomerIncome`, {});
        message.success("Report successfully genereted!");
        setData(result.data);
      } catch(err) {
        message.error("Internal error. Please try again.");
      }
    }
    fetchData();
  }, []);

  const columns = [
    {
      title: 'Customer Name',
      dataIndex: 'customer_name',
      key: 'customer_name',
    },
    {
      title: 'Gross Income',
      dataIndex: 'gross_income',
      key: 'gross_income',
    },
    {
      title: 'First Date',
      dataIndex: 'first_date',
      key: 'first_date',
    },
    {
      title: 'Most Recent Date',
      dataIndex: 'recent_date',
      key: 'recent_date',
    },
    {
        title: 'Number of Sales',
        dataIndex: 'number_of_sales',
        key: 'number_of_sales',
        default: 0
    },
    {
        title: 'Number of Repairs',
        dataIndex: 'number_of_repairs',
        key: 'number_of_repairs',
        default: 0
    },
    {
        title: 'Action',
        key: 'action',
        render: (text, record) => (
          <Link to={`/customerIncome/${record.customer_id}`}>
          <Space size="middle">
            <a>View Details</a>
          </Space>
          </Link>
        ),
      },

  ];


  return (
    localStorage.getItem('usertype') === "Owner" || localStorage.getItem('usertype') === "Manager" ?
    <div>
      <h1>Gross Customer Income</h1>
      <Table columns={columns} dataSource={data}></Table>
      
    </div>
    :
    <div>
      <h1>Gross Customer Income</h1>
      <h1>No Access to this page. Please login as Manager or Owner.</h1>
    </div>
    
  );
}


export default GrossCustomerIncome;