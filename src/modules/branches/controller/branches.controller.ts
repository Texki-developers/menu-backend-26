import { Body, Controller, Post, HttpCode, HttpStatus, Get, Query, Delete, Param, Patch, Res, UseGuards, Req } from '@nestjs/common';
import * as express from 'express';
import { BranchService } from '../services/branches.service';
import { CreateBranchDto } from '../dto/create-branches.dto';
import { UpdateBranchDto } from '../dto/update-branches.dto';
import { ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Branch } from '../schema/branches.schema';
import { GetAllBranchesDto } from '../dto/get-all-branches.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

@Controller('branches')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BranchesController {
    constructor(
        private readonly branchService: BranchService,
    ){}

    @Get('download')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({summary:'Download branches as CSV',description:'Download all branches and their details as a CSV file'})
    @ApiResponse({status:HttpStatus.OK, description: 'CSV file download initiates'})
    async downloadBranchesCsv(@Res() res: any, @Req() req: any){
        return this.branchService.downloadBranchesCsv(res, req.user.organizationId);
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({summary:'Get all branches',description:'Get all branches scoped to the admin org'})
    @ApiResponse({status:HttpStatus.OK,type:Branch})
    async getAllBranches(@Query() getAllBranchesDto: GetAllBranchesDto, @Req() req: any){
        // Always scope to the admin's organization from the JWT
        getAllBranchesDto.organization_id = req.user.organizationId;
        return this.branchService.getAllBranches(getAllBranchesDto);
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({summary:'Get a branch',description:'Get a branch by ID'})
    @ApiResponse({status:HttpStatus.OK,type:Branch})
    async getBranchById(@Param('id') id: string){
        return this.branchService.getBranchById(id);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({summary:'Create a new branch',description:'Create a new branch'})
    @ApiResponse({status:HttpStatus.CREATED,type:Branch})
    async createBranch(@Body() createBranchDto: CreateBranchDto, @Req() req: any){
        // Automatically scope new branch to the admin's organization
        createBranchDto.organization_id = req.user.organizationId;
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
