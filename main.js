let eventBus = new Vue()
Vue.component('product', {
  props: {
    premium: {
      type: Boolean,
      required: true
    }
  },
  template: `
  <div class="product">
    <div class="product-img">
    <img v-bind:src="image" :alt="image_alt">
    </div>
    <div class="product-info">
      <h1>{{ title }}</h1>
      <p>{{ description }}</p>
      <p v-if="inStock">In Stock</p>
      <p v-else>Out of Stock</p>
      <p>Shipping: {{ shipping }}</p>
      <span>{{ sale }}</span>
      <a class="more-link" :href="link" target="_blank">More products like this</a>

      <ul>
        <li v-for="detail in details">{{ detail }}</li>
      </ul>

      <div v-for="(variant, index) in variants" 
          :key="variant.variantId"
          :style="{ backgroundColor: variant.variantColor}" 
          @mouseover="updateColor(index)"
          class="cart-box">
      </div>

      <button v-on:click="addToCard"
              :disabled="!inStock"
              :class="{ disabledButton: !inStock }"
              class="cart-button add-button"
              >
              Add to card
      </button>
    </div>

    <product-tabs :reviews="reviews"></product-tabs>
  </div>
  `,
  data() {
    return {
      brand: "Vue",
      product: "Socks",
      description: "It is very comfortable, quality",
      selectedVariant: 0,
      image_alt: "Socks img",
      onSale: true,
      link: 'https://www.amazon.com/s/ref=nb_sb_noss?url=search-alias%3Daps&field-keywords=socks',
      details: ['80% cotton', '20% polyester', 'Gender - neutral'],
      variants: [
        {
          variantId: 20,
          variantColor: 'green',
          variantImage: 'https://www.vuemastery.com/images/challenges/vmSocks-green-onWhite.jpg',
          variantQuantity: 10
        },
        {
          variantId: 21,
          variantColor: 'blue',
          variantImage: 'https://www.vuemastery.com/images/challenges/vmSocks-blue-onWhite.jpg',
          variantQuantity: 5
        }
      ],
      reviews: []
    }
  },
  methods: {
    addToCard() {
      this.$emit('add-to-cart', this.variants[this.selectedVariant]);
    },
    updateColor(index){
      this.selectedVariant = index;
    }
  },
  computed: {
    title() {
      return this.brand + ' ' + this.product
    },
    image() {
      return this.variants[this.selectedVariant].variantImage
    },
    inStock() {
      return this.variants[this.selectedVariant].variantQuantity
    },
    sale() {
      if(this.onSale){
        return this.brand + ' ' + this.product + ' ' + 'is on sale' 
      } else {
        return this.brand + ' ' + this.product + ' ' + 'is not on sale' 
      }
    },
    shipping() {
      if(this.premium){
        return 'free'
      } else return '2.99$'
    }
  },
  mounted() {
    eventBus.$on('review-submited', productReview => {
      this.reviews.push(productReview)
    })
  }
})

Vue.component('product-review', {
  template: `
  <form class="review-form" @submit.prevent="onSubmit()">
    <p>
      <label for="name">Name:</label>
      <input id="name" v-model="name">
    </p>
    <p>
      <label for="review">Review:</label>
      <textarea id="review" v-model="review"></textarea>
    </p>
    <p>
      <label for="rating">Rating:</label>
      <select id="rating" v-model="rating">
        <option value="5">5</option>
        <option value="4">4</option>
        <option value="3">3</option>
        <option value="2">2</option>
        <option value="1">1</option>
      </select>
    </p>
    <p>
      <input type="submit" value="Submit">
    </p>
  </form>
  `,
  data() {
    return {
      name: null,
      review: null,
      rating: null,
      errors: []
    }
  },
  methods: {
    onSubmit() {
      if(this.name && this.review && this.rating){
        let productReview = {
          name: this.name,
          review: this.review,
          rating: this.rating
        }
        eventBus.$emit('review-submited', productReview)
        this.name = null,
        this.review = null,
        this.rating = null
      } else {
        if(!this.name) this.errors.push("Name rquired")
        if(!this.review) this.errors.push("Rewiev rquired")
        if(!this.rating) this.errors.push("Rating rquired")
      }
    }
  }
})

Vue.component('product-tabs', {
  props: {
    reviews: {
      type: Array,
      required: true
    }
  },
  template: `
    <div class="review-section">
      <ul class="tabs">
        <li class="tab"
              :class="{activeTab: selectedTab == tab}"
              v-for="(tab, index) in tabs"
              @click="selectTab(tab)"
              :key="index"
        >{{ tab }}</li>
      </ul>

      <div v-show="selectedTab === 'Reviews'">
        <p v-if="!reviews.length">There are no reviews yet.</p>
        <ul v-else>
          <li v-for="(review, index) in reviews" :key="index">
            <p>Name: {{ review.name }}</p>
            <p>Rating: {{ review.rating }}</p>
            <p>Review: {{ review.review }}</p>
          </li>
        </ul>
      </div>

      <div v-show="selectedTab === 'Write a Review'">
        <product-review></product-review>
      </div>
    </div>
  `,
  data() {
    return {
      tabs: ["Reviews", "Write a Review"],
      selectedTab: "Reviews"
    }
  },
  methods: {
    selectTab(tab) {
      this.selectedTab = tab
    }
  }
})

let app = new Vue({
  el: "#app",
  data: {
    premium: true,
    cart: []
  },
  methods: {
    updateCart(obj) {
      if(this.cart.some(item => item.id == obj.variantId)){
        this.cart.find(item => item.id == obj.variantId).count += 1;
      } else {
        this.cart.push({
          id: obj.variantId,
          color: obj.variantColor,
          count: 1
        })
      }
    }
  }
})