'use client';

import React, { useState, useEffect, ChangeEvent } from 'react';
import { Form, Input, Select, Button, Typography, Layout } from 'antd';
import PhoneInput, { CountryData } from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import OtpInput from './OtpInput';
import Swal from "sweetalert2";

const { Title } = Typography;
const { Option } = Select;
const { Content } = Layout;

interface Country {
  id: string;
  name: string;
}

interface State {
  id: string;
  name: string;
}

interface Premise {
  id: string;
  name: string;
}

interface SubPremise {
  id: string;
  name: string;
}

interface PremiseUnit {
  id: string;
  name: string;
}

const Register = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [premises, setPremises] = useState<Premise[]>([]);
  const [subPremises, setSubPremises] = useState<SubPremise[]>([]);
  const [premiseUnits, setPremiseUnits] = useState<PremiseUnit[]>([]);
  const [phone, setPhone] = useState<string>('');
  const [countryCode, setCountryCode] = useState<string>('');
  const [otp, setOtp] = useState<string>('');
  const [otpVisible, setOtpVisible] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');


  useEffect(() => {
    Swal.fire({
      title: 'Registration Required',
      text: 'You need to register before logging in. Please complete the registration process.',
      icon: 'info',
      confirmButtonColor: '#1890ff',
      width: '350px',
      showClass: {
        popup: 'animate__animated animate__fadeInDown'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp'
      }
    });
    fetch('/api/getCountryList')
      .then((res) => res.json())
      .then((data) => setCountries(data));
  }, []);

  const handleCountryChange = async (value: string) => {
    const res = await fetch(`/api/getStateList?countryId=${value}`);
    const data = await res.json();
    setStates(data);
  };

  const handlePremiseChange = async (value: string) => {
    const res = await fetch(`/api/getPremiseList?stateId=${value}`);
    const data = await res.json();
    setPremises(data);
  };

  const handleSubPremiseChange = async (value: string) => {
    const res = await fetch(`/api/getSubPremiseList?premiseId=${value}`);
    const data = await res.json();
    setSubPremises(data);
  };

  const handlePremiseUnitChange = async (value: string) => {
    const res = await fetch(`/api/getPremiseUnitList?subPremiseId=${value}`);
    const data = await res.json();
    setPremiseUnits(data);
  };

  const sendOtp = async () => {
    const res = await fetch('/api/generateRegistrationOTP', {
      method: 'POST',
      body: JSON.stringify({ phone: `${countryCode}${phone}` }),
      headers: { 'Content-Type': 'application/json' },
    });
    setOtpVisible(true);

    if (res.ok) {
      setOtpVisible(true);
    }
  };

  const verifyOtp = async () => {
    const res = await fetch('/api/validateOTPAndRegister', {
      method: 'POST',
      body: JSON.stringify({ phone: `${countryCode}${phone}`, otp }),
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.ok) {
      alert('Registration successful!');
    } else {
      alert('Registration failed. Please try again.');
    }
  };

  const handleOtpChange = (e: ChangeEvent<HTMLInputElement>) => {
    setOtp(e.target.value);
  };



  const handleUsernameChange = (phone: string, country: any) => {
    const reducedPhone = phone.replace(country.dialCode, '',);
    // console.log(reducedPhone);
    // console.log(country.dialCode);
    // console.log(country.dialCode + '-' + reducedPhone);
    const paddedCountryCode = country.dialCode.padStart(5, '0');
    const uname = paddedCountryCode + reducedPhone
    setUsername(uname);
  };

  return (
    <Layout className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <Content className="flex flex-col items-center w-full max-w-md md:max-w-lg lg:max-w-xl bg-white p-6 rounded-lg shadow-lg">
        <img
          src="http://139.84.169.221:3001/_next/image?url=%2Fimages%2Flogo%2Flogo.png&w=64&q=75"
          alt="Servizing Logo"
          className="mb-6 w-24 h-auto"
        />
        <Title level={2} className="text-center text-gray-800 font-semibold">
          Sign up
        </Title>
        <Form layout="vertical" className="w-full">
          <Form.Item name="name" rules={[{ required: true, message: 'Please enter your name!' }]}>
            <Input placeholder="Full Name" className="p-2 rounded-md border border-gray-300" />
          </Form.Item>

          <Form.Item name="country" rules={[{ required: true, message: 'Select your country!' }]}>
            <Select placeholder="Select your country" onChange={handleCountryChange} className="w-full">
              {countries.map((country) => (
                <Option key={country.id} value={country.id}>
                  {country.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="state" rules={[{ required: true, message: 'Select your state!' }]}>
            <Select placeholder="Select your state" onChange={handlePremiseChange} className="w-full">
              {states.map((state) => (
                <Option key={state.id} value={state.id}>
                  {state.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="premise" rules={[{ required: true, message: 'Select your premise!' }]}>
            <Select placeholder="Select your premise" onChange={handleSubPremiseChange} className="w-full">
              {premises.map((premise) => (
                <Option key={premise.id} value={premise.id}>
                  {premise.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="premise" rules={[{ required: true, message: 'Select your premise!' }]}>
            <Select placeholder="Select your Sub premise" onChange={handleSubPremiseChange} className="w-full">
              {premises.map((premise) => (
                <Option key={premise.id} value={premise.id}>
                  {premise.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="premise" rules={[{ required: true, message: 'Select your premise!' }]}>
            <Select placeholder="Select your premise Unit" onChange={handleSubPremiseChange} className="w-full">
              {premises.map((premise) => (
                <Option key={premise.id} value={premise.id}>
                  {premise.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <PhoneInput
              country={'in'}
              onChange={handleUsernameChange}
              inputStyle={{ width: '100%' }}
              enableSearch={true}
              containerClass="w-full rounded-lg border border-stroke bg-transparent dark:border-form-strokedark dark:bg-form-input"
              inputClass="w-full py-4 pl-6 pr-20 text-black outline-none focus:border-primary focus-visible:shadow-none dark:text-white dark:focus:border-primary"
            />
            {!otpVisible && (
            <Button type="primary" onClick={sendOtp} className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white">
              Send OTP
            </Button>
            )}
          </Form.Item>

          {otpVisible && (
            <Form.Item>
              <div className="p-2 sm:p-4">
                <OtpInput maxLength={6} handleOtpChange={handleOtpChange} />
              </div>
              <Button type="primary" onClick={verifyOtp} className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white">
                Verify OTP
              </Button>
            </Form.Item>
          )}

          <Form.Item>
            <Button type="primary" htmlType="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
              Register
            </Button>
          </Form.Item>
        </Form>
      </Content>
    </Layout>
  );
};

export default Register;
