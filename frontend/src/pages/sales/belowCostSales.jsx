import React, { useState, useEffect } from 'react';
import { Table, message, Tag, Space } from 'antd';
import { domain } from '../../config';
import moment from 'moment';
import axios from 'axios';


const BelowCostSales = () => {

  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await axios.post(`${domain}viewReport/belowCostSale`, {});
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
      title: 'VIN',
      dataIndex: 'VIN',
      key: 'VIN',
    },
    {
      title: 'Sale Date',
      dataIndex: 'date',
      key: 'date',
      render: (text)=>{
        return moment(text).format('YYYY-MM-DD');
      },
    },
    {
      title: 'Invoice Price',
      dataIndex: 'invoice_price',
      key: 'invoice_price',
    },
    {
      title: 'Sold Price',
      dataIndex: 'sold_price',
      key: 'sold_price',
    },
    {   title: 'Price Ratio',
    dataIndex: 'price_ratio',
    render: (text, record) => {
      return (
        <div
          style={{
            color: (record.sold_price/record.invoice_price) <=0.95  ? '#DB4C64' :  '#000',
          }}
        >
          {text}
        </div>
      );
    },
},
    {
        title: 'Customer Name',
        dataIndex: 'customer_name',
        key: 'customer_name',
    },
    {   title: 'Salesperson Name',
        dataIndex: 'salesperson_name',
        key: 'salesperson_name',
    },
  ];


  return (
    sessionStorage.getItem('usertype') === "Owner" || sessionStorage.getItem('usertype') === "Manager" ?
    <div>
      <h1>Below Cost Sales</h1>
      <Table columns={columns} dataSource={data}></Table>
    </div>
    :
    <div>
      <h1>Below Cost Sales</h1>
      <h1>No Access to this page. Please login as Manager or Owner.</h1>
    </div>
  );
}


export default BelowCostSales;