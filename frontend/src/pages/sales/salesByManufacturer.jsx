import React, { useState, useEffect } from 'react';
import { Table, message, } from 'antd';
import { domain } from '../../config';

import axios from 'axios';


const SalesByManufacturerTable = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await axios.post(`${domain}viewSales/byManufacturer`, {});
        message.success("Report successfully genereted!");

        let data = [];
        let idx = 0;
        for (const [key, value] of Object.entries(result.data)) {
          data.push({...value, key: idx, manufacturer: key});
          idx++;
        }
        setData(data);
      } catch(err) {
        message.error("Internal error. Please try again.");
      }
    }
    if (sessionStorage.getItem('usertype') === "Owner" || sessionStorage.getItem('usertype') === "Manager") {
      fetchData();
    }
  }, []);

  const columns = [
    {
      title: 'Manufacturer',
      dataIndex: 'manufacturer',
      key: 'manufacturer',
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
      <h1>View Sales by Manufacturer</h1>  
      <Table columns={columns} dataSource={data}></Table>
    </div>
    :
    <div>
      <h1>No Access to this page. Please login as Owner or Manager.</h1>
    </div>
  );
}


export default SalesByManufacturerTable;