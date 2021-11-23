import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, message,  Table, Descriptions } from 'antd';
import { domain } from '../../config';
import { useParams } from 'react-router-dom';

import axios from 'axios';


const MonthlySaleDetail = () => {
  const { year, month } = useParams();

  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await axios.post(`${domain}viewReport/monthlySales/details`, {
          year: year,
          month: month,
        });
        console.log("result", result);
        setData(result.data);
      } catch(err) {
        console.log(err);
        message.error("Internal erorr. Please try again.");
      }
    };

    if (localStorage.getItem('usertype')) {
      fetchData();
    }
  }, []);
  


  return ( 
    localStorage.getItem('usertype') ?
    <div>
        { data && data.length > 0 ?
        (
          <Descriptions title="Top Salesperson of The Month" bordered>
            <Descriptions.Item label="Year">{year}</Descriptions.Item>
            <Descriptions.Item label="Month">{month}</Descriptions.Item>
            <Descriptions.Item label="Name">{data[0].name}</Descriptions.Item>
            <Descriptions.Item label="Number of Sales">{data[0].vehicles_sold}</Descriptions.Item>
            <Descriptions.Item label="Total Sales">{data[0].total_sales}</Descriptions.Item>
          </Descriptions>
        ) : 
        (
          <Descriptions title="Top Salesperson of The Month" bordered>
            <Descriptions.Item label="Year">{year}</Descriptions.Item>
            <Descriptions.Item label="Month">{month}</Descriptions.Item>
            <Descriptions.Item label="Name">No sale this month!</Descriptions.Item>
          </Descriptions>
        )
      }
        <div>
            <Button Type="link" href="/monthlySales">Cancel</Button>
        </div>
    </div> 
    :
    <div>
      <h1>No Access to this page. Please login.</h1>
    </div>
  );
}


export default MonthlySaleDetail;