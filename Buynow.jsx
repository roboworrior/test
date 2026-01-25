import React, { useContext, useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { Cart } from '../App';
import { useNavigate } from 'react-router-dom';
import useData from './useData';
import Swal from "sweetalert2";

const handel = (nevi) => {
    console.log("go to explore");
    nevi("/");
};


function datacmp(el, temCart, data) {
    data.map((item) =>
        item.name === el ? temCart.push(item) : null
    );
}

export default function Buynow() {
    const nevi = useNavigate();
    let totalprice = 0;
    const { data, fetchData } = useData([]);
    const [cartItems, setCartItems] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone_number: '',
        cartItems: []
    });

    // Fetch data if not already fetched
    useEffect(() => {
        if (data.length === 0) {
            fetchData();
        }
    }, [data, fetchData]);

    // Populate cartItems after data is fetched
    useEffect(() => {
        if (data.length > 0) {
            let temCart = [];
            Cart.map((item) => datacmp(item, temCart, data));
            setCartItems(temCart);
        }
    }, [data]);

    function removeItem(index) {
        const updatedCartItems = cartItems.filter((_, i) => i !== index);
        setCartItems(updatedCartItems);

        // Update the global Cart array
        Cart.splice(index, 1);

        const o=document.querySelector('.cartcount');
        o.innerHTML=Cart.length;



        setFormData({ ...formData, cartItems: updatedCartItems });
    }

    function addItem(item) {
        const updatedCartItems = [...cartItems, item];
        setCartItems(updatedCartItems);

        // Update the global Cart array
        Cart.push(item);

        setFormData({ ...formData, cartItems: updatedCartItems });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormData((prevFormData) => {
            const updatedFormData = { ...prevFormData, cartItems: cartItems };
            submitForm(updatedFormData);
            return updatedFormData;
        });
    };

    const submitForm = async (updatedFormData) => {

        try {
            

            const response = await fetch('https://bakendtest.vercel.app/api/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedFormData),
            });
            
            const data = await response.json();
            if (!response.ok) {
                // console.log(data.message);
                
                throw new Error(data.message);
            }

            console.log('Data saved successfully:', data);
            // Cart=[]; // Clear the Cart array
            Swal.fire({
            icon: "success",
            title: "Order now !",
            text: "Order has been submitted, we will reach you soon",
          });

           
            setCartItems([]); // Clear the cart items in the component state
            Cart.length = 0; // Clear the global Cart array
            nevi("/");


            // Reset form or handle success
        } catch (error) {
              Swal.fire({
                    icon: "error",
                    title: "Order faild!",
                    text: error,
                  });
            // Handle error
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="footerfix">
            <div className="buynow">
                <h1>Checkout</h1>
                <input
                    type="text"
                    name="name"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={handleChange}
                />
                <input
                    type="text"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                />


                <input
                    type="text"
                    name="phone_number"
                    placeholder="Enter your phone number"
                    value={formData.phone_number}
                    onChange={handleChange}
                />
                <button onClick={handleSubmit}>Place order</button>
                <button onClick={() => handel(nevi)}>Explore more</button>
                <div className="litems">
                    {cartItems.map((item, i) => (
                        <li key={i}>
                            <img id="iconimage" src={item.img} alt="not found" /> {item.name} <p className='green inline'>{item.price}</p>
                            <button onClick={() => removeItem(i)} id="remove" >x</button>
                           
                        </li>
                    ))}
                    {
                        cartItems.forEach(ele => {
                            
                            totalprice+=Number(ele.price)
                        })
                    }


                    <div className="total">
                        Total order value ₹ {totalprice}
                    </div>
                </div>

            </div>
                <p className='red mt-50 ml-5'>To order anonymously, you can place your order without login. Log in only if you want to track your order.<Link to="/login">Click on this</Link> for login and use the same email in Checkout input</p>
        </div>
    );
}