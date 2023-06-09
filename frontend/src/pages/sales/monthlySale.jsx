import React, { useState, useEffect } from 'react';
import { Table, message, Tag, Space } from 'antd';
import { domain } from '../../config';
import {
  Link
} from "react-router-dom";

import axios from 'axios';


const MonthlySales = () => {

  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await axios.post(`${domain}viewReport/monthlySales`, {});
        message.success("Report successfully genereted!");

        let data = [];
        let idx = 0;
        for (const [key, value] of Object.entries(result.data)) {
          data.push({...value, key: idx, color: key});
          idx++;
        }
        setData(data);
      } catch(err) {
        message.error("Internal error. Please try again.");
      }
    }
    fetchData();
  }, []);

  const columns = [
    {
      title: 'Year',
      dataIndex: 'year',
      key: 'year',
    },
    {
      title: 'Month',
      dataIndex: 'month',
      key: 'month',
    },
    {
      title: 'Number of Vehicles',
      dataIndex: 'number_of_vehicles',
      key: 'number_of_vehicles',
    },
    {
        title: 'Total Sales Income',
        dataIndex: 'total_sales_income',
        key: 'total_sales_income',
    },
    {
        title: 'Total Net Income',
        dataIndex: 'total_net_income',
        key: 'total_net_income',
    },
    {   title: 'Price Ratio',
        dataIndex: 'price_ratio',
        render: (text, record) => {
          return (
            <div
              style={{
                color: record.total_sales_income/(record.total_sales_income-record.total_net_income) >= 1.25  ? '#24b39b' : (record.total_sales_income/(record.total_sales_income-record.total_net_income) <= 1.1  ?'#F7BA0B' : '#000'),
              }}
            >
              {text}
            </div>
          );
        },
    },
    {
      title: 'Action',
      key: 'action',
      render: (text, record) => (
          <Link to={`/monthlySaleDetail/${record.year}/${record.month}`}>
          <Space size="middle">
            <a>View Details</a>
          </Space>
          </Link>
      ),
    },

  ];


  return (
    sessionStorage.getItem('usertype') === "Owner" || sessionStorage.getItem('usertype') === "Manager" ?
    <div>
      <h1>Monthly Sales</h1>
      <Table columns={columns} dataSource={data}></Table>
      
    </div>
    :
    <div>
      <h1>Monthly Sales</h1>
      <h1>No Access to this page. Please login as Manager or Owner.</h1>
    </div>
  );
}


export default MonthlySales;