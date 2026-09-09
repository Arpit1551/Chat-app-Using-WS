import React from 'react'

function InputBar() {
  return (
    <>
        <input 
            type="text"
            className='border-b-2 border-gray-700 px-2 outline-none'
            placeholder='Username'
            min={4}
            max={10}
            />
    </>
  )
}

export default InputBar