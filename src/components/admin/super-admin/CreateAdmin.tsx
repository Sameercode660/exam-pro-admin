'use client'

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Country, State } from "country-state-city";
import { useAuth } from "@/context/AuthContext";

const CreateAdmin = () => {
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const { user } = useAuth();
  const [form, setForm] = useState({
    orgName: "",
    orgEmail: "",
    orgPhone: "",
    orgAddress: "",
    orgState: "",
    orgCountry: "",
    orgCountryCode: "",
    name: "",
    email: "",
    mobileNumber: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const countryList = Country.getAllCountries();
    setCountries(countryList);
  }, []);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const countryCode = e.target.value;
    const selectedCountry = countries.find((c) => c.isoCode === countryCode);


    setForm({
      ...form,
      orgCountry: selectedCountry.name,
      orgCountryCode: selectedCountry.phonecode,
      orgState: "",
    });

    const stateList = State.getStatesOfCountry(countryCode);
    setStates(stateList);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const generatePassword = (name: string) => {
    const clean = name.split(" ")[0].toLowerCase();
    const rand = Math.random().toString(36).substring(2, 7);
    return `${clean}_${rand}`;
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setForm({
      ...form,
      name,
      password: generatePassword(name),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    for (const [key, value] of Object.entries(form)) {
      if (!value.trim()) {
        setMsg(`❌ ${key} field cannot be empty`);
        return;
      }
    }

    setLoading(true);
    setMsg("");

    try {
      const resoponse = await axios.post(`${process.env.NEXT_PUBLIC_ROOT_URL}/super-admin/create-admin`, {
        organization: {
          name: form.orgName,
          email: form.orgEmail,
          phone: form.orgPhone,
          address: form.orgAddress,
          State: form.orgState,
          Country: form.orgCountry,
          CountryCode: form.orgCountryCode,
        },
        user: {
          name: form.name,
          email: form.email,
          mobileNumber: form.mobileNumber,
          password: form.password,
          createdById: user?.id,
        },
      });
      if (resoponse.data.status == 400) {
        setMsg(resoponse.data.error);
      }
      console.log(resoponse.data)
      setMsg("Admin and Organization created successfully!");
    } catch (error) {
      console.error(error);
      setMsg("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white shadow-xl rounded-xl max-w-4xl mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Create Admin & Organization</h2>
      {msg && <p className="mb-4 text-blue-500 font-medium">{msg}</p>}

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
        {/* Organization Info */}
        <input className="input" type="text" name="orgName" placeholder="Organization Name" onChange={handleChange} />
        <input className="input" type="text" name="orgEmail" placeholder="Organization Email" onChange={handleChange} />

        <select className="input" name="orgCountry" onChange={handleCountryChange}>
          <option value="">Select Country</option>
          {countries.map((country) => (
            <option key={country.isoCode} value={country.isoCode}>
              {country.name}
            </option>
          ))}
        </select>

        <select className="input" name="orgState" onChange={handleChange} value={form.orgState}>
          <option value="">Select State</option>
          {states.map((state) => (
            <option key={state.name} value={state.name}>
              {state.name}
            </option>
          ))}
        </select>

        <div className="flex items-center border rounded-md w-full overflow-hidden">
          {/* + sign */}
          <span className="px-2 text-gray-500">+</span>

          {/* Country code (small, readOnly) */}
          <input
            className="w-14 outline-none bg-transparent text-gray-700"
            type="text"
            name="orgCountryCode"
            value={form.orgCountryCode}
            readOnly
          />

          {/* Phone number (expands) */}
          <input
            className="flex-1 outline-none bg-transparent px-2"
            type="text"
            name="orgPhone"
            placeholder="Organization Phone"
            onChange={handleChange}
          />
        </div>

        <input className="input" type="text" name="orgAddress" placeholder="Address" onChange={handleChange} />
        {/* Admin Info */}
        <input className="input" type="text" name="name" placeholder="Admin Name" value={form.name} onChange={handleNameChange} />
        <input className="input" type="email" name="email" placeholder="Admin Email" onChange={handleChange} />
        <input className="input" type="text" name="mobileNumber" placeholder="Mobile Number" onChange={handleChange} />
        <input className="input" type="text" name="password" placeholder="Generated Password" value={form.password} readOnly />

        <div className="col-span-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl mt-4 hover:bg-blue-700 transition"
          >
            {loading ? "Creating..." : "Create Admin"}
          </button>
        </div>
      </form>

      <style jsx>{`
        .input {
          padding: 10px;
          border-radius: 8px;
          border: 1px solid #ccc;
          width: 100%;
        }
      `}</style>
    </div>
  );
};

export default CreateAdmin;
