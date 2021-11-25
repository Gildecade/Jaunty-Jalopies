import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, message, Descriptions } from 'antd';
import { domain } from '../../config';
import { useParams } from 'react-router-dom';

import axios from 'axios';


const VehicleDetail = () => {
  const { id, vehicle_type } = useParams();

  const [data, setData] = useState({});

  useEffect(() => {
    const viewDetail = async () => {
      try {
        const result = await axios.post(`${domain}vehicle/view`, {
          vin: id,
          vehicle_type: vehicle_type,
          usertype: sessionStorage.getItem('usertype')
        });
        console.log(result);
        setData(result.data);
      } catch(err) {
        console.log(err);
        message.error("Internal erorr. Please try again.");
      }
    };

    if (sessionStorage.getItem('usertype')) {
      console.log(sessionStorage.getItem('usertype'));
      viewDetail();
    }
  }, []);
  
  return ( 
    sessionStorage.getItem('usertype') ?
    <div>
      { data.saleData && data.saleData.length > 0 ?
        (
          <Descriptions title="Vehicle Sale Information" bordered>
            <Descriptions.Item label="Customer ID">{data.saleData[0].customer_id}</Descriptions.Item>
            <Descriptions.Item label="Purchase Data">{data.saleData[0].purchase_date}</Descriptions.Item>
            <Descriptions.Item label="Salespeople Username">{data.saleData[0].salespeople_username}</Descriptions.Item>
            <Descriptions.Item label="Sold Price">{data.saleData[0].sold_price}</Descriptions.Item>
          </Descriptions>
        ) : 
        (
          <Descriptions title="Vehicle Sale Information" bordered>
            <Descriptions.Item label="Sale Status">Vehicle not sold yet.</Descriptions.Item>
          </Descriptions>
        )
      }

      { data.repairData && data.repairData.length > 0 ?
        (
          <Descriptions title="Vehicle Repair Information" bordered>
            <Descriptions.Item label="Start Date">{data.repairData[0].start_date}</Descriptions.Item>
            <Descriptions.Item label="Complete Date">{data.repairData[0].complete_date ? data.repairData.complete_date : "Not complete yet."}</Descriptions.Item>
            <Descriptions.Item label="Purchase Data">{data.repairData[0].customer_id}</Descriptions.Item>
            <Descriptions.Item label="Description">{data.repairData[0].description}</Descriptions.Item>
            <Descriptions.Item label="Labor Charge">{data.repairData[0].labor_charge}</Descriptions.Item>
            <Descriptions.Item label="Odometer">{data.repairData[0].odometer}</Descriptions.Item>
            <Descriptions.Item label="Parts Cost">{data.repairData[0].parts_cost}</Descriptions.Item>
            <Descriptions.Item label="Servic Writer Username">{data.repairData[0].service_writer_username}</Descriptions.Item>
          </Descriptions>
        ) :
        (
          <Descriptions title="Vehicle Repair Information" bordered>
            <Descriptions.Item label="Repair Status">No repair yet.</Descriptions.Item>
          </Descriptions>
        )
      }

      { data.vehicleTypeData && data.vehicleTypeData.length > 0 ?
        (
          <Descriptions title="Vehicle Type Information" bordered>
            <Descriptions.Item label="Type Info">{JSON.stringify(data.vehicleTypeData[0])}</Descriptions.Item>
          </Descriptions>
        ) :
        (
          <Descriptions title="Vehicle Type Information" bordered>
            <Descriptions.Item label="Type Info">No type information.</Descriptions.Item>
          </Descriptions>
        )
      }
    </div> 
    :
    <div>
      <h1>No Access to this page. Please login.</h1>
    </div>
  );
}


export default VehicleDetail;