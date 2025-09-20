import apiClient from './apiClient.js';
import { API_ENDPOINTS } from '../config/api.js';

// Manufacturing Orders Service
class ManufacturingOrdersService {
  // Get all manufacturing orders with optional filters
  async getOrders(filters = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.MANUFACTURING_ORDERS.BASE, filters);
      return {
        success: true,
        data: response.data || [],
        totalCount: response.totalCount || 0,
      };
    } catch (error) {
      console.error('Get manufacturing orders error:', error);
      return {
        success: false,
        message: error.message,
        data: [],
      };
    }
  }

  // Get manufacturing order by ID
  async getOrderById(id) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.MANUFACTURING_ORDERS.BY_ID(id));
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Get manufacturing order by ID error:', error);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // Create new manufacturing order
  async createOrder(orderData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.MANUFACTURING_ORDERS.BASE, orderData);
      return {
        success: true,
        data: response.data,
        message: response.message || 'Manufacturing order created successfully',
      };
    } catch (error) {
      console.error('Create manufacturing order error:', error);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // Update manufacturing order
  async updateOrder(id, orderData) {
    try {
      const response = await apiClient.put(API_ENDPOINTS.MANUFACTURING_ORDERS.BY_ID(id), orderData);
      return {
        success: true,
        data: response.data,
        message: response.message || 'Manufacturing order updated successfully',
      };
    } catch (error) {
      console.error('Update manufacturing order error:', error);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // Update manufacturing order status
  async updateOrderStatus(id, status) {
    try {
      const response = await apiClient.patch(API_ENDPOINTS.MANUFACTURING_ORDERS.UPDATE_STATUS(id), { status });
      return {
        success: true,
        data: response.data,
        message: response.message || 'Status updated successfully',
      };
    } catch (error) {
      console.error('Update manufacturing order status error:', error);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // Assign manufacturing order
  async assignOrder(id, assigneeData) {
    try {
      const response = await apiClient.patch(API_ENDPOINTS.MANUFACTURING_ORDERS.ASSIGN(id), assigneeData);
      return {
        success: true,
        data: response.data,
        message: response.message || 'Order assigned successfully',
      };
    } catch (error) {
      console.error('Assign manufacturing order error:', error);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // Delete manufacturing order
  async deleteOrder(id) {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.MANUFACTURING_ORDERS.BY_ID(id));
      return {
        success: true,
        message: response.message || 'Manufacturing order deleted successfully',
      };
    } catch (error) {
      console.error('Delete manufacturing order error:', error);
      return {
        success: false,
        message: error.message,
      };
    }
  }
}

// Products Service
class ProductsService {
  // Get all products with optional filters
  async getProducts(filters = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PRODUCTS.BASE, filters);
      return {
        success: true,
        data: response.data || [],
        totalCount: response.totalCount || 0,
      };
    } catch (error) {
      console.error('Get products error:', error);
      return {
        success: false,
        message: error.message,
        data: [],
      };
    }
  }

  // Search products
  async searchProducts(query) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PRODUCTS.SEARCH, { query });
      return {
        success: true,
        data: response.data || [],
      };
    } catch (error) {
      console.error('Search products error:', error);
      return {
        success: false,
        message: error.message,
        data: [],
      };
    }
  }

  // Get product by ID
  async getProductById(id) {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.PRODUCTS.BASE}/${id}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Get product by ID error:', error);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // Create new product
  async createProduct(productData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.PRODUCTS.BASE, productData);
      return {
        success: true,
        data: response.data,
        message: response.message || 'Product created successfully',
      };
    } catch (error) {
      console.error('Create product error:', error);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // Update product
  async updateProduct(id, productData) {
    try {
      const response = await apiClient.put(`${API_ENDPOINTS.PRODUCTS.BASE}/${id}`, productData);
      return {
        success: true,
        data: response.data,
        message: response.message || 'Product updated successfully',
      };
    } catch (error) {
      console.error('Update product error:', error);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // Delete product
  async deleteProduct(id) {
    try {
      const response = await apiClient.delete(`${API_ENDPOINTS.PRODUCTS.BASE}/${id}`);
      return {
        success: true,
        message: response.message || 'Product deleted successfully',
      };
    } catch (error) {
      console.error('Delete product error:', error);
      return {
        success: false,
        message: error.message,
      };
    }
  }
}

// Work Centers Service
class WorkCentersService {
  // Get all work centers
  async getWorkCenters(filters = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.WORK_CENTERS.BASE, filters);
      return {
        success: true,
        data: response.data || [],
      };
    } catch (error) {
      console.error('Get work centers error:', error);
      return {
        success: false,
        message: error.message,
        data: [],
      };
    }
  }

  // Get work center by ID
  async getWorkCenterById(id) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.WORK_CENTERS.BY_ID(id));
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Get work center by ID error:', error);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // Get work center availability
  async getWorkCenterAvailability(id, date) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.WORK_CENTERS.AVAILABILITY(id), { date });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Get work center availability error:', error);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // Create work center
  async createWorkCenter(workCenterData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.WORK_CENTERS.BASE, workCenterData);
      return {
        success: true,
        data: response.data,
        message: response.message || 'Work center created successfully',
      };
    } catch (error) {
      console.error('Create work center error:', error);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // Update work center
  async updateWorkCenter(id, workCenterData) {
    try {
      const response = await apiClient.put(API_ENDPOINTS.WORK_CENTERS.BY_ID(id), workCenterData);
      return {
        success: true,
        data: response.data,
        message: response.message || 'Work center updated successfully',
      };
    } catch (error) {
      console.error('Update work center error:', error);
      return {
        success: false,
        message: error.message,
      };
    }
  }
}

// Stock Service
class StockService {
  // Get stock inventory
  async getInventory(filters = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.STOCK.INVENTORY, filters);
      return {
        success: true,
        data: response.data || [],
      };
    } catch (error) {
      console.error('Get stock inventory error:', error);
      return {
        success: false,
        message: error.message,
        data: [],
      };
    }
  }

  // Get stock movements
  async getMovements(filters = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.STOCK.MOVEMENTS, filters);
      return {
        success: true,
        data: response.data || [],
      };
    } catch (error) {
      console.error('Get stock movements error:', error);
      return {
        success: false,
        message: error.message,
        data: [],
      };
    }
  }

  // Get stock by product
  async getStockByProduct(productId) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.STOCK.BY_PRODUCT(productId));
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Get stock by product error:', error);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // Create stock movement
  async createMovement(movementData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.STOCK.MOVEMENTS, movementData);
      return {
        success: true,
        data: response.data,
        message: response.message || 'Stock movement recorded successfully',
      };
    } catch (error) {
      console.error('Create stock movement error:', error);
      return {
        success: false,
        message: error.message,
      };
    }
  }
}

// BOM Service
class BOMService {
  // Get all BOMs
  async getBOMs(filters = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.BOM.BASE, filters);
      return {
        success: true,
        data: response.data || [],
      };
    } catch (error) {
      console.error('Get BOMs error:', error);
      return {
        success: false,
        message: error.message,
        data: [],
      };
    }
  }

  // Get BOM by ID
  async getBOMById(id) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.BOM.BY_ID(id));
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Get BOM by ID error:', error);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // Get BOM by product
  async getBOMByProduct(productId) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.BOM.BY_PRODUCT(productId));
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Get BOM by product error:', error);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // Create BOM
  async createBOM(bomData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.BOM.BASE, bomData);
      return {
        success: true,
        data: response.data,
        message: response.message || 'BOM created successfully',
      };
    } catch (error) {
      console.error('Create BOM error:', error);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // Update BOM
  async updateBOM(id, bomData) {
    try {
      const response = await apiClient.put(API_ENDPOINTS.BOM.BY_ID(id), bomData);
      return {
        success: true,
        data: response.data,
        message: response.message || 'BOM updated successfully',
      };
    } catch (error) {
      console.error('Update BOM error:', error);
      return {
        success: false,
        message: error.message,
      };
    }
  }
}

// Create singleton instances
export const manufacturingOrdersService = new ManufacturingOrdersService();
export const productsService = new ProductsService();
export const workCentersService = new WorkCentersService();
export const stockService = new StockService();
export const bomService = new BOMService();

// Export all services as default
export default {
  manufacturingOrders: manufacturingOrdersService,
  products: productsService,
  workCenters: workCentersService,
  stock: stockService,
  bom: bomService,
};