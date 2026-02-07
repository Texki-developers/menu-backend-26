import { Body, Controller, Delete, Get, Param, Patch, Post, ConflictException, NotFoundException } from '@nestjs/common';
import { BranchService } from './branch.service';
import { CreateBranchDTO, UpdateBranchDTO } from './dto/branch.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('branch')
@Controller('branch')
export class BranchController {
    constructor(private readonly branchService: BranchService) {}

    @ApiOperation({ summary: 'Create a new branch' })
    @ApiResponse({ status: 201, description: 'The branch has been successfully created.' })
    @ApiResponse({ status: 409, description: 'Branch code already exists.' })
    @ApiResponse({ status: 404, description: 'Organization not found.' })
    @Post()
    async create(@Body() createBranchDTO: CreateBranchDTO) {
        const isBranchExist = await this.branchService.isBranchCodeExist(createBranchDTO.code);
        if (isBranchExist) {
            throw new ConflictException(`Branch with code ${createBranchDTO.code} already exists`);
        }
        return this.branchService.create(createBranchDTO);
    }

    @ApiOperation({ summary: 'Get all branches' })
    @Get()
    async findAll() {
        return this.branchService.findAll();
    }

    @ApiOperation({ summary: 'Get a branch by ID' })
    @ApiResponse({ status: 200, description: 'Return the branch.' })
    @ApiResponse({ status: 404, description: 'Branch not found.' })
    @Get(':id')
    async findOne(@Param('id') id: string) {
        const branch = await this.branchService.findOne(id);
        if (!branch) {
            throw new NotFoundException(`Branch with ID ${id} not found`);
        }
        return branch;
    }

    @ApiOperation({ summary: 'Update a branch by ID' })
    @ApiResponse({ status: 200, description: 'The branch has been successfully updated.' })
    @ApiResponse({ status: 404, description: 'Branch not found.' })
    @Patch(':id')
    async update(@Param('id') id: string, @Body() updateBranchDTO: UpdateBranchDTO) {
        const branch = await this.branchService.update(id, updateBranchDTO);
        if (!branch) {
            throw new NotFoundException(`Branch with ID ${id} not found`);
        }
        return branch;
    }

    @ApiOperation({ summary: 'Delete a branch by ID' })
    @ApiResponse({ status: 200, description: 'The branch has been successfully deleted.' })
    @ApiResponse({ status: 404, description: 'Branch not found.' })
    @Delete(':id')
    async remove(@Param('id') id: string) {
        const branch = await this.branchService.remove(id);
        if (!branch) {
            throw new NotFoundException(`Branch with ID ${id} not found`);
        }
        return { message: 'Branch deleted successfully' };
    }
}
