import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProductService } from '../services/product.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { GetAllProductsDto } from '../dto/get-all-products.dto';
import { Product } from '../schemas/product.schema';

@ApiTags('products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a product', description: 'Add a new product to the catalog' })
  @ApiResponse({ status: HttpStatus.CREATED, type: Product })
  async createProduct(@Body() dto: CreateProductDto) {
    return this.productService.createProduct(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List products', description: 'Paginated list with optional filters' })
  async getAllProducts(@Query() dto: GetAllProductsDto) {
    return this.productService.getAllProducts(dto);
  }

  @Get('download')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Download products as CSV', description: 'Download all active products as a CSV file' })
  @ApiResponse({ status: HttpStatus.OK, description: 'CSV file download initiates' })
  async downloadProductsCsv(@Res() res: any) {
    return this.productService.downloadProductsCsv(res);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a product by ID' })
  @ApiResponse({ status: HttpStatus.OK, type: Product })
  async getProductById(@Param('id') id: string) {
    return this.productService.getProductById(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a product' })
  @ApiResponse({ status: HttpStatus.OK, type: Product })
  async updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productService.updateProduct(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete a product', description: 'Sets is_deleted=true, is_active=false' })
  async deleteProduct(@Param('id') id: string) {
    return this.productService.deleteProduct(id);
  }
}
