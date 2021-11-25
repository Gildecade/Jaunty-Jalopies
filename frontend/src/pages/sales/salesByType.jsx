import React, { useState, useEffect } from 'react';
import { Table, message, } from 'antd';
import { domain } from '../../config';

import axios from 'axios';


const SalesByTypeTable = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await axios.post(`${domain}viewSales/byType`, {});
        message.success("Report successfully genereted!");

        let data = [];
        let idx = 0;
        for (const [key, value] of Object.entries(result.data)) {
          data.push({...value, key: idx, type: key});
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
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Sales in Past 30 Days',
      dataIndex: 'past30Days',
      key: 'past30Days',
    },
    {
      title: 'Sales in Past Year',
      dataIndex: 'pastYear',
      key: 'pastYear',
    },
    {
      title: 'Sales in All Times',
      dataIndex: 'allTime',
      key: 'allTime',
    },
  ];


  return (
    sessionStorage.getItem('usertype') === "Owner" || sessionStorage.getItem('usertype') === "Manager" ?
    <div>
      <Table columns={columns} dataSource={data}></Table>
    </div>
    :
    <div>
      <h1>No Access to this page. Please login as Owner.</h1>
    </div>
  );
}


export default SalesByTypeTable;