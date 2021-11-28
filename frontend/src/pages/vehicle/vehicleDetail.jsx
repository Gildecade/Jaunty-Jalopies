import React, { useState, useEffect } from 'react';
import { message, Descriptions, Button } from 'antd';
import { domain } from '../../config';
import { useParams, Link } from 'react-router-dom';

import axios from 'axios';


const VehicleDetail = () => {
  const { id, vehicle_type } = useParams();

  const [vehicleData, setVehicleData] = useState(null);
  const [saleData, setSaleData] = useState(null);
  const [repairData, setRepairData] = useState(null);
  const [customerData, setCustomerData] = useState(null);

  const usertype = sessionStorage.getItem('usertype');

  const getVehicleData = async () => {
    try {
      const vehicleData = await axios.post(`${domain}vehicle/id`, { vin: id, vehicle_type: vehicle_type });
      console.log("vehicleData", vehicleData);
      setVehicleData(vehicleData.data);
    } catch(err) {
      console.log(err);
      message.error("Internal erorr. Please try again.");
    }
  };

  const getSaleData = async () => {
    try {
      const saleData = await axios.post(`${domain}vehicle/sale`, { vin: id });
      if (saleData.data.length !== 0) {
        const customer_id = saleData.data[0].customer_id;
        const customerData = await axios.post(`${domain}customer/lookup/${customer_id}`);
        console.log("customerData", customerData);
        setCustomerData(customerData.data);
      }
      console.log("saleData", saleData);
      setSaleData(saleData.data);
    } catch(err) {
      console.log(err);
      message.error("Internal erorr. Please try again.");
    }
  };

  const getRepairData = async () => {
    try {
      const repairData = await axios.post(`${domain}vehicle/repair`, { vin: id });
      console.log("repairData", repairData);
      setRepairData(repairData.data);
    } catch(err) {
      console.log(err);
      message.error("Internal erorr. Please try again.");
    }
  };

  useEffect(() => {
    const usertype = sessionStorage.getItem('usertype');

    getVehicleData();
    if (usertype === 'Manager' || usertype === 'Owner') {
      getSaleData();
      getRepairData();
    }
  }, []);
  
  return ( 
    usertype != null ?
    <div>
      <h1>View Vehicle Detail Page</h1>
      { vehicleData && vehicleData.typeInfo.length > 0 && vehicleData.vehicle.length > 0 ? 
        <Descriptions title="Vehicle Information" bordered>
          <Descriptions.Item label="VIN">{vehicleData.vehicle[0].vin}</Descriptions.Item>
          <Descriptions.Item label="Description">{vehicleData.vehicle[0].description}</Descriptions.Item>
          <Descriptions.Item label="Added Date">{vehicleData.vehicle[0].added_date}</Descriptions.Item>
          <Descriptions.Item label="Inventory Clerk Username">{vehicleData.vehicle[0].inventory_clerk_username}</Descriptions.Item>
          <Descriptions.Item label="Invoice Price">{vehicleData.vehicle[0].invoice_price}</Descriptions.Item>
          <Descriptions.Item label="Manufacturer">{vehicleData.vehicle[0].manufacturer}</Descriptions.Item>
          <Descriptions.Item label="Model Name">{vehicleData.vehicle[0].model_name}</Descriptions.Item>
          <Descriptions.Item label="Model Year">{vehicleData.vehicle[0].model_year}</Descriptions.Item>
          <Descriptions.Item label="Vehicle Type">{vehicleData.vehicle[0].vehicle_type}</Descriptions.Item>
          <Descriptions.Item label="Attributes">{JSON.stringify(vehicleData.typeInfo[0])}</Descriptions.Item>
        </Descriptions>
        :
        <div></div>
      }
      { saleData && saleData.length > 0 ?
        <Descriptions title="Vehicle Sale Information" bordered>
          <Descriptions.Item label="Customer ID">{saleData[0].customer_id}</Descriptions.Item>
          <Descriptions.Item label="Purchase Data">{saleData[0].purchase_date}</Descriptions.Item>
          <Descriptions.Item label="Salespeople Username">{saleData[0].salespeople_username}</Descriptions.Item>
          <Descriptions.Item label="Sold Price">{saleData[0].sold_price}</Descriptions.Item>
        </Descriptions>
        :
        <Descriptions title="Vehicle Sale Information" bordered>
          <Descriptions.Item label="Sale Status">Vehicle not sold yet.</Descriptions.Item>
        </Descriptions>
      }
      { repairData && repairData.length > 0 ?
        <Descriptions title="Vehicle Repair Information" bordered>
          <Descriptions.Item label="Start Date">{repairData[0].start_date}</Descriptions.Item>
          <Descriptions.Item label="Complete Date">{repairData[0].complete_date ? repairData[0].complete_date : "Not complete yet."}</Descriptions.Item>
          <Descriptions.Item label="Purchase Data">{repairData[0].customer_id}</Descriptions.Item>
          <Descriptions.Item label="Description">{repairData[0].description}</Descriptions.Item>
          <Descriptions.Item label="Labor Charge">{repairData[0].labor_charge}</Descriptions.Item>
          <Descriptions.Item label="Odometer">{repairData[0].odometer}</Descriptions.Item>
          <Descriptions.Item label="Parts Cost">{repairData[0].parts_cost}</Descriptions.Item>
          <Descriptions.Item label="Servic Writer Username">{repairData[0].service_writer_username}</Descriptions.Item>
          <Descriptions.Item label="Customer Information">{JSON.stringify(customerData[0])}</Descriptions.Item>
        </Descriptions>
        :
        <Descriptions title="Vehicle Repair Information" bordered>
          <Descriptions.Item label="Repair Status">No repair yet.</Descriptions.Item>
        </Descriptions>
      }
      <div style={{height: '30px'}}></div>
      { usertype === 'Salespeople' || usertype === 'Owner' ?
        <Link to={`/vehicle/sell/${id}`}>
          <Button type="link">Sell Vehicle</Button>
        </Link>
        :
        <div></div>
      }
    </div> 
    :
    <div>
      <h1>View Vehicle Detail Page</h1>
      { vehicleData && vehicleData.typeInfo.length > 0 && vehicleData.vehicle.length > 0 ? 
        <Descriptions title="Vehicle Information" bordered>
          <Descriptions.Item label="VIN">{vehicleData.vehicle[0].vin}</Descriptions.Item>
          <Descriptions.Item label="Description">{vehicleData.vehicle[0].description}</Descriptions.Item>
          <Descriptions.Item label="Added Date">{vehicleData.vehicle[0].added_date}</Descriptions.Item>
          <Descriptions.Item label="Inventory Clerk Username">{vehicleData.vehicle[0].inventory_clerk_username}</Descriptions.Item>
          <Descriptions.Item label="Manufacturer">{vehicleData.vehicle[0].manufacturer}</Descriptions.Item>
          <Descriptions.Item label="Model Name">{vehicleData.vehicle[0].model_name}</Descriptions.Item>
          <Descriptions.Item label="Model Year">{vehicleData.vehicle[0].model_year}</Descriptions.Item>
          <Descriptions.Item label="Vehicle Type">{vehicleData.vehicle[0].vehicle_type}</Descriptions.Item>
          <Descriptions.Item label="Attributes">{JSON.stringify(vehicleData.typeInfo[0])}</Descriptions.Item>
        </Descriptions>
        :
        <div></div>
      }
    </div>
  );
}


export default VehicleDetail;