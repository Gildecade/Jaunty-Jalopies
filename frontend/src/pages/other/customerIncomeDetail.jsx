import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, message,  Table } from 'antd';
import { domain } from '../../config';
import { useParams } from 'react-router-dom';

import axios from 'axios';


const CustomerIncomeDetail = () => {
  const { customer_id } = useParams();

  const [salesData, setSalesData] = useState([]);

  const [repairData, setRepairsData] = useState([]);

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const salesResult = await axios.post(`${domain}viewReport/grossCustomerIncome/sales`, {
          customer_id: customer_id,
        });
        console.log("salesResut", salesResult);
        setSalesData(salesResult.data);
      } catch(err) {
        console.log(err);
        message.error("Internal erorr. Please try again.");
      }
    }
    const fetchRepairData = async () => {
        try {
          const repairResult = await axios.post(`${domain}viewReport/grossCustomerIncome/repairs`, {
            customer_id: customer_id,
          });
          setRepairsData(repairResult.data);
          console.log(repairResult);
        } catch(err) {
          console.log(err);
          message.error("Internal erorr. Please try again.");
        }
      }
    ;

    if (localStorage.getItem('usertype')) {
    //   console.log(localStorage.getItem('usertype'));
      fetchSalesData();
      fetchRepairData();
    console.log("id", customer_id);
    }
  }, []);
  
  const salesColumns = [
    {
      title: 'Sale Date',
      dataIndex: 'sale_date',
      key: 'sale_date',
    },
    {
      title: 'Sold Price',
      dataIndex: 'sold_price',
      key: 'sold_price',
    },
    {
      title: 'VIN',
      dataIndex: 'VIN',
      key: 'VIN',
    },
    {
      title: 'Year',
      dataIndex: 'year',
      key: 'year',
    },
    {
      title: 'Manufacturer',
      dataIndex: 'manufacturer',
      key: 'manufacturer',
    },
    {
      title: 'Model',
      dataIndex: 'model',
      key: 'model',
    },
    {
      title: 'Salesperson Name',
      dataIndex: 'salesperson_name',
      key: 'salesperson_name',
    },
  ];

  const repairColumns = [
    {
      title: 'Start Date',
      dataIndex: 'start_date',
      key: 'start_date',
    },
    {
      title: 'End Date',
      dataIndex: 'end_date',
      key: 'end_date',
    },
    {
      title: 'VIN',
      dataIndex: 'VIN',
      key: 'VIN',
    },
    {
      title: 'Odometer Reading',
      dataIndex: 'odometer_reading',
      key: 'odometer_reading',
    },
    {
      title: 'Parts Cost',
      dataIndex: 'parts_cost',
      key: 'parts_cost',
    },
    {
      title: 'Larbor Cost',
      dataIndex: 'larbor_cost',
      key: 'larbor_cost',
    },
    {
      title: 'Total Cost',
      dataIndex: 'total_cost',
      key: 'total_cost',
    },
    {
        title: 'Service Writer Name',
        dataIndex: 'service_writer_name',
        key: 'service_writer_name',
    },
  ];

  return ( 
    localStorage.getItem('usertype') ?
    <div>
        <div>
            <h1>Customer Sales History (Customer_ID : {customer_id})</h1>
            <Table columns={salesColumns} dataSource={salesData}></Table>
        </div>     
        <div>
            <h1>Customer Repair History (Customer_ID : {customer_id})</h1>
            <Table columns={repairColumns} dataSource={repairData}></Table>
        </div>
        <div>
            <Button Type="link" href="/grossCustomerIncome">Cancel</Button>
        </div>
    </div> 
    :
    <div>
      <h1>No Access to this page. Please login.</h1>
    </div>
  );
}


export default CustomerIncomeDetail;