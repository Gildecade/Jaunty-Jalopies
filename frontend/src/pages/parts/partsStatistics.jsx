import React, { useState, useEffect } from 'react';
import { Table, message, Tag, Space } from 'antd';
import { domain } from '../../config';

import axios from 'axios';


const PartsStatistics = () => {

  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await axios.post(`${domain}viewReport/partStatistics`, {});
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
      title: 'Vender Name',
      dataIndex: 'vendor_name',
      key: 'vendor_name',
    },
    {
      title: 'Number of Parts',
      dataIndex: 'number_of_parts',
      key: 'number_of_parts',
    },
    {
        title: 'Total Spent',
        dataIndex: 'total_spent',
        key: 'total_spent',
      },
  ];


  return (
    localStorage.getItem('usertype') === "Owner" || localStorage.getItem('usertype') === "Manager" ?
    <div>
      <h1>Part Statistics</h1>
      <Table columns={columns} dataSource={data}></Table>
      
    </div>
    :
    <div>
      <h1>Part Statistics</h1>
      <h1>No Access to this page. Please login as Manager or Owner.</h1>
    </div>
  );
}


export default PartsStatistics;