import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, message, Descriptions } from 'antd';
import { domain } from '../../config';
import { useParams } from 'react-router-dom';

import axios from 'axios';


const VehicleDetail = () => {
  const { id } = useParams();
  
  return (
    <div>
      <p>{id}</p>
    </div>
  );
}


export default VehicleDetail;