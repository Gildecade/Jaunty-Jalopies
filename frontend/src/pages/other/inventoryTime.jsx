import React, { useState, useEffect } from 'react';
import { Table, message, Tag, Space } from 'antd';
import { domain } from '../../config';

import axios from 'axios';


const InventoryTime = () => {

  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await axios.post(`${domain}viewReport/averageTime`, {});
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
      title: 'Vehicle Type',
      dataIndex: 'vehicle_type',
      key: 'vehicle_type',
    },
    {
      title: 'Average Time in Inventory',
      dataIndex: 'average_time',
      key: 'average_time',
    },
  ];


  return (
    localStorage.getItem('usertype') === "Owner" || localStorage.getItem('usertype') === "Manager" ?
    <div>
      <h1>Average Time in Inventory</h1>
      <Table columns={columns} dataSource={data}></Table>
      
    </div>
    :
    <div>
      <h1>Average Time in Inventory</h1>
      <h1>No Access to this page. Please login as Manager or Owner.</h1>
    </div>
  );
}


export default InventoryTime;