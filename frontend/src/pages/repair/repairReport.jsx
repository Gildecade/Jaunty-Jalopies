import React, { useState, useEffect } from 'react';
import { Table, message, Tag, Space } from 'antd';
import { domain } from '../../config';
import {
    Link
  } from "react-router-dom";

import axios from 'axios';


const RepairReport = () => {

  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await axios.post(`${domain}viewReport/repairReport`, {});
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
      title: 'Manufacturer',
      dataIndex: 'manufacturer',
      key: 'manufacturer',
    },
    {
      title: 'Number of Repairs',
      dataIndex: 'count_of_repairs',
      key: 'count_of_repairs',
    },
    {
      title: 'Parts Cost',
      dataIndex: 'sum_parts_cost',
      key: 'sum_parts_cost',
    },
    {
      title: 'Labor Cost',
      dataIndex: 'sum_labor_cost',
      key: 'sum_labor_cost',
    },
    {
        title: 'Total Repair Cost',
        dataIndex: 'sum_repair_cost',
        key: 'sum_repair_cost',
    },
    {
        title: 'Action',
        key: 'action',
        render: (text, record) => (
            <Link to={`/repairReportDetail/${record.manufacturer}`}>
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
      <Table columns={columns} dataSource={data}></Table>
      
    </div>
    :
    <div>
      <h1>No Access to this page. Please login as Manager or Owner.</h1>
    </div>
  );
}


export default RepairReport;