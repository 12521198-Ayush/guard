// components/AddButton.js  
import React from 'react';  
import Swal from 'sweetalert2';  

const AddButton = () => {  
  const handleAdd = (option) => {  
    console.log('Added:', option);  
    // You can add the logic for what happens after an option is selected  
  };  

  const handleClick = () => {  
    Swal.fire({  
      title: 'Select an Option',  
      icon: 'question',  
      showCancelButton: true,  
      confirmButtonText: 'Add Option 1',  
      cancelButtonText: 'Cancel',  
      // Adding the second option as a custom button  
      footer: `  
        <button id="option2" class="swal2-confirm swal2-styled" style="margin: 5px;">Add Option 2</button>  
        <button id="option3" class="swal2-confirm swal2-styled" style="margin: 5px;">Add Option 3</button>  
      `,  
    }).then((result) => {  
      if (result.isConfirmed) {  
        handleAdd('Option 1');  
      } else if (result.dismiss === Swal.DismissReason.cancel) {  
        return; // Do nothing if the cancel button is clicked  
      } else {  
        // Handle custom buttons  
        document.getElementById('option2')?.addEventListener('click', () => {  
          Swal.close(); // Close the Swal  
          handleAdd('Option 2');  
        });  

        document.getElementById('option3')?.addEventListener('click', () => {  
          Swal.close(); // Close the Swal  
          handleAdd('Option 3');  
        });  
      }  
    });  
  };  

  return (  
  
    <div className='ml-8' onClick={handleClick}>
      <img width="50" height="50" src="https://img.icons8.com/arcade/50/add.png" alt="add"/>
    </div>
  );  
};  

export default AddButton;  