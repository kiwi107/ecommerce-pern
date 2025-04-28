import React from 'react'

import { useEffect, useState } from 'react'
import TagProducts from '../components/TagProducts'
<<<<<<< HEAD
//import image names landscape.jpg from assets



=======
import Navbar from '../components/Navbar'
>>>>>>> 8c3dbb0f791c298f9e3f7f28cd5cb37a05773d81

function Home() {
  const [tags, setTags] = useState([])

  const fetchTags = async () => {
    fetch('http://localhost:8000/products/tags')
      .then((response) => response.json())
      .then((data) => setTags(data.tags))
      .catch((error) => console.error('Error fetching tags:', error));
  }


  useEffect(() => {
    fetchTags()
    // getProductsForTag(1)

  }, [])




  return (
    <div>
    <img src="/images/landscape.jpg" alt="Landscape" className='img-fluid' style={{ width: '100%', height: '300px' }} />
      {tags.map((tag) => (
        <div key={tag.tag_id}>
          <h3 className='text-center'>{tag.tag_name}</h3>
          <TagProducts tag_id={tag.tag_id} />
        </div>
      ))}
    </div>
  )
}

export default Home