import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, message,  Table } from 'antd';
import { domain } from '../../config';
import { useParams } from 'react-router-dom';

import axios from 'axios';


const RepairReportDetail = () => {
  const { manufacturer } = useParams();

  const [typeData, setTypeData] = useState([]);

  const [modelData, setModelData] = useState([]);

  useEffect(() => {
    const fetchTypeData = async () => {
      try {
        const typeResult = await axios.post(`${domain}viewReport/repairReport/type`, {
          manufacturer: manufacturer,
        });
        console.log("typeResult", typeResult);
        setTypeData(typeResult.data);
      } catch(err) {
        console.log(err);
        message.error("Internal erorr. Please try again.");
      }
    }
    const fetchModelData = async () => {
        try {
          const modelResult = await axios.post(`${domain}viewReport/repairReport/model`, {
            manufacturer: manufacturer,
          });
          setModelData(modelResult.data);
          console.log(modelResult);
        } catch(err) {
          console.log(err);
          message.error("Internal erorr. Please try again.");
        }
      }
    ;

    if (localStorage.getItem('usertype')) {
    //   console.log(localStorage.getItem('usertype'));
      fetchTypeData();
      fetchModelData();
    }
  }, []);
  
  const typeColumns = [
    {
      title: 'Vehicle Type',
      dataIndex: 'vehicle_type',
      key: 'vehicle_type',
    },
    {
      title: 'Number of Repairs',
      dataIndex: 'number_of_repairs',
      key: 'number_of_repairs',
    },
    {
      title: 'Parts Cost',
      dataIndex: 'parts_cost',
      key: 'parts_cost',
    },
    {
      title: 'Labor Cost',
      dataIndex: 'labor_cost',
      key: 'labor_cost',
    },
    {
      title: 'Total Cost',
      dataIndex: 'total_cost',
      key: 'total_cost',
    },
  ];

  const modelColumns = [
    {
        title: 'Vehicle Type',
        dataIndex: 'vehicle_type',
        key: 'vehicle_type',
      },
      {
        title: 'Model Name',
        dataIndex: 'model',
        key: 'model',
      },
      {
        title: 'Number of Repairs',
        dataIndex: 'number_of_repairs',
        key: 'number_of_repairs',
      },
      {
        title: 'Parts Cost',
        dataIndex: 'parts_cost',
        key: 'parts_cost',
      },
      {
        title: 'Labor Cost',
        dataIndex: 'labor_cost',
        key: 'labor_cost',
      },
      {
        title: 'Total Cost',
        dataIndex: 'total_cost',
        key: 'total_cost',
      },
  ];

  return ( 
    localStorage.getItem('usertype') ?
    <div>
        <div>
            <h1>Repair History by Vehicle Type</h1>
            <Table columns={typeColumns} dataSource={typeData}></Table>
        </div>     
        <div>
            <h1>Repair History by Model</h1>
            <Table columns={modelColumns} dataSource={modelData}></Table>
        </div>
        <div>
            <Button Type="link" href="/repairReport">Cancel</Button>
        </div>
    </div> 
    :
    <div>
      <h1>No Access to this page. Please login.</h1>
    </div>
  );
}


export default RepairReportDetail;