const mockData = require('./mockData');
const bcrypt = require('bcryptjs');

class MockQuery {
  constructor(data, model, originalType) {
    this.data = Array.isArray(data) ? [...data] : (data ? [data] : []);
    this.model = model;
    this.originalType = originalType; // 'array' or 'single'
  }

  // Helper to wrap items with Mongoose-like methods before returning
  wrap(item) {
    if (!item) return item;
    return this.model.wrapWithMethods(item);
  }

  sort(options) {
    if (typeof options === 'object') {
      const field = Object.keys(options)[0];
      const direction = options[field];
      this.data.sort((a, b) => {
        if (a[field] < b[field]) return direction === 1 ? -1 : 1;
        if (a[field] > b[field]) return direction === 1 ? 1 : -1;
        return 0;
      });
    }
    return this;
  }

  limit(num) {
    if (num > 0) this.data = this.data.slice(0, num);
    return this;
  }

  select(fields) {
    // Basic field selection (not fully implemented but keeps it fluent)
    return this;
  }

  populate(path) {
    // Basic hydration (could be expanded if needed)
    return this;
  }

  // Support thenable for 'await'
  then(resolve, reject) {
    if (this.originalType === 'single') {
      resolve(this.wrap(this.data[0] || null));
    } else {
      resolve(this.data.map(item => this.wrap(item)));
    }
  }
}

class MockModel {
  constructor(modelName, schema) {
    this.modelName = modelName.toLowerCase() + 's';
    this.collection = mockData[this.modelName] || [];
    this.schema = schema;
  }

  // Advanced query matching
  match(item, query) {
    for (let key in query) {
      if (key === '$or') {
        if (!query.$or.some(subQuery => this.match(item, subQuery))) return false;
        continue;
      }
      if (key === '$and') {
        if (!query.$and.every(subQuery => this.match(item, subQuery))) return false;
        continue;
      }

      const val = query[key];
      const itemVal = item[key];

      if (typeof val === 'object' && val !== null) {
        // Handle operators
        if (val.$regex) {
          const regex = new RegExp(val.$regex, val.$options || '');
          if (!regex.test(itemVal)) return false;
        } else if (val.$in) {
          if (!val.$in.includes(itemVal)) return false;
        } else if (val.$gte) {
          if (!(itemVal >= val.$gte)) return false;
        } else if (val.$lte) {
          if (!(itemVal <= val.$lte)) return false;
        } else if (val.$ne) {
          if (itemVal === val.$ne) return false;
        }
      } else {
        // Direct match with case-insensitivity for emails
        if (typeof itemVal === 'string' && typeof val === 'string' && key === 'email') {
          if (itemVal.toLowerCase() !== val.toLowerCase()) return false;
        } else {
          if (itemVal !== val) return false;
        }
      }
    }
    return true;
  }

  find(query = {}) {
    console.log(`[MockDB] FIND in ${this.modelName}:`, JSON.stringify(query));
    const filtered = this.collection.filter(item => this.match(item, query));
    return new MockQuery(filtered, this, 'array');
  }

  findOne(query = {}) {
    console.log(`[MockDB] FIND_ONE in ${this.modelName}:`, JSON.stringify(query));
    const item = this.collection.find(item => this.match(item, query));
    return new MockQuery(item, this, 'single');
  }

  findById(id) {
    if (!id) return new MockQuery(null, this, 'single');
    const idStr = id.toString();
    const item = this.collection.find(item => item._id === idStr || item._id.toString() === idStr);
    return new MockQuery(item, this, 'single');
  }

  async create(data) {
    const mongoose = require('mongoose');
    const newItem = {
      _id: new mongoose.Types.ObjectId().toString(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    if (this.modelName === 'users' && newItem.password) {
      const salt = await bcrypt.genSalt(10);
      newItem.password = await bcrypt.hash(newItem.password, salt);
    }

    this.collection.push(newItem);
    return this.wrapWithMethods(newItem);
  }

  findByIdAndUpdate(id, update, options = {}) {
    const idStr = id ? id.toString() : '';
    const index = this.collection.findIndex(item => item._id === idStr || item._id.toString() === idStr);
    if (index === -1) return new MockQuery(null, this, 'single');
    
    // Support atomic operators like $set or raw update
    const actualUpdate = update.$set || update;
    const updatedItem = { ...this.collection[index], ...actualUpdate, updatedAt: new Date() };
    this.collection[index] = updatedItem;
    return new MockQuery(updatedItem, this, 'single');
  }

  async countDocuments(query = {}) {
    return this.collection.filter(item => this.match(item, query)).length;
  }

  aggregate(pipeline) {
    // Very basic aggregation support (only matches/groups)
    let results = [...this.collection];
    for (const stage of pipeline) {
      if (stage.$match) {
        results = results.filter(item => this.match(item, stage.$match));
      }
      // Simple group by category for /api/services/categories
      if (stage.$group && stage.$group._id === '$category') {
        const groups = {};
        results.forEach(item => {
          const cat = item.category;
          if (!groups[cat]) groups[cat] = { _id: cat, count: 0, avgPrice: 0, total: 0 };
          groups[cat].count++;
          groups[cat].total += item.price;
        });
        results = Object.values(groups).map(g => {
          g.avgPrice = g.total / g.count;
          return g;
        });
      }
    }
    return new MockQuery(results, this, 'array');
  }

  wrapWithMethods(item) {
    if (!item) return item;
    const modelName = this.modelName;
    
    // Add Mongoose instance methods
    if (modelName === 'users') {
      item.comparePassword = async function(candidatePassword) {
        console.log(`[MockDB] comparePassword for ${this.email}`);
        return await bcrypt.compare(candidatePassword, this.password);
      };
    }
    
    if (!item.save) {
      item.save = async function() { 
        console.log(`[MockDB] SAVE (mock logic) for ${modelName} ID: ${this._id}`);
        return this; 
      };
    }
    
    if (!item.toObject) {
      item.toObject = function() { return { ...this }; };
    }
    
    if (!item.toJSON) {
      item.toJSON = function() { return { ...this }; };
    }

    return item;
  }
}

const initializedModels = {};

const getMockModel = (name, schema) => {
  if (!initializedModels[name]) {
    initializedModels[name] = new MockModel(name, schema);
  }
  return initializedModels[name];
};

module.exports = { getMockModel };
