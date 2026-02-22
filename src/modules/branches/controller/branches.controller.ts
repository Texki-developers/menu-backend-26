import { Body, Controller, Post, HttpCode, HttpStatus, Get, Query, Delete, Param, Patch, Res } from '@nestjs/common';
import * as express from 'express';
import { BranchService } from '../services/branches.service';
import { CreateBranchDto } from '../dto/create-branches.dto';
import { UpdateBranchDto } from '../dto/update-branches.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Branch } from '../schema/branches.schema';
import { GetAllBranchesDto } from '../dto/get-all-branches.dto';

@Controller('branches')
export class BranchesController {
    constructor(
        private readonly branchService: BranchService,
    ){}

    @Get('download')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({summary:'Download branches as CSV',description:'Download all branches and their details as a CSV file'})
    @ApiResponse({status:HttpStatus.OK, description: 'CSV file download initiates'})
    async downloadBranchesCsv(@Res() res: any){
        return this.branchService.downloadBranchesCsv(res);
    }

    @Get('get-all')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({summary:'Get all branches',description:'Get all branches'})
    @ApiResponse({status:HttpStatus.OK,type:Branch})
    async getAllBranches(@Query() getAllBranchesDto:GetAllBranchesDto){
        return this.branchService.getAllBranches(getAllBranchesDto);
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({summary:'Get a branch',description:'Get a branch by ID'})
    @ApiResponse({status:HttpStatus.OK,type:Branch})
    async getBranchById(@Param('id') id: string){
        return this.branchService.getBranchById(id);
    }

    @Post('create')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({summary:'Create a new branch',description:'Create a new branch'})
    @ApiResponse({status:HttpStatus.CREATED,type:Branch})
    async createBranch(@Body() createBranchDto: CreateBranchDto){
        return this.branchService.createBranch(createBranchDto);
    }

    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({summary:'Update a branch',description:'Update a branch by ID'})
    @ApiResponse({status:HttpStatus.OK, description: 'Branch updated successfully', type: Branch})
    async editBranch(@Param('id') id: string, @Body() updateBranchDto: UpdateBranchDto){
        return this.branchService.updateBranch(id, updateBranchDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({summary:'Remove a branch',description:'Remove a branch by ID'})
    @ApiResponse({status:HttpStatus.OK, description: 'Branch removed successfully'})
    async removeBranch(@Param('id') id: string){
        return this.branchService.deleteBranch(id);
    }
}
