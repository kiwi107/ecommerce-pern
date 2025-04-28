import React from 'react'

import { useEffect, useState } from 'react'
import TagProducts from '../components/TagProducts'
//import image names landscape.jpg from assets




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