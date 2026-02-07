import { Body, Controller, Delete, Get, Param, Patch, Post, NotFoundException } from "@nestjs/common";
import { OrganizationService } from "./organization.service";
import { slugify } from "src/common/utils";
import { CreateOrganizationDTO, UpdateOrganizationDTO } from "./dto";
import { Organization } from "./schemas";
import { CreateOrganizationInput } from "./types";
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('organization')
@Controller('organization')
export class OrganizationController {
    constructor(private readonly service: OrganizationService) {}

    @ApiOperation({ summary: 'Create a new organization' })
    @ApiResponse({ status: 201, description: 'The organization has been successfully created.' })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @Post()
    async create(@Body() body: CreateOrganizationDTO): Promise<any> {
        const slug = await this.service.generateUniqueSlug(body.name)
        const organization: CreateOrganizationInput = {
            ...body,
            slug,
            status: 'active'
        }
        return this.service.create(organization);
    }

    @ApiOperation({ summary: 'Get all organizations' })
    @ApiResponse({ status: 200, description: 'Return all organizations.' })
    @Get()
    async getAll(){
        return this.service.findAll()
    }

    @ApiOperation({ summary: 'Get an organization by ID' })
    @ApiResponse({ status: 200, description: 'Return the organization.' })
    @ApiResponse({ status: 404, description: 'Organization not found.' })
    @Get(':id')
    async findOne(@Param('id') id: string) {
        const organization = await this.service.findOne(id);
        if (!organization) {
            throw new NotFoundException(`Organization with ID ${id} not found`);
        }
        return organization;
    }

    @ApiOperation({ summary: 'Update an organization by ID' })
    @ApiResponse({ status: 200, description: 'The organization has been successfully updated.' })
    @ApiResponse({ status: 404, description: 'Organization not found.' })
    @Patch(':id')
    async update(@Param('id') id: string, @Body() updateOrganizationDTO: UpdateOrganizationDTO) {
        const organization = await this.service.update(id, updateOrganizationDTO);
        if (!organization) {
            throw new NotFoundException(`Organization with ID ${id} not found`);
        }
        return organization;
    }

    @ApiOperation({ summary: 'Delete an organization by ID' })
    @ApiResponse({ status: 200, description: 'The organization has been successfully deleted.' })
    @ApiResponse({ status: 404, description: 'Organization not found.' })
    @Delete(':id')
    async remove(@Param('id') id: string) {
        const organization = await this.service.remove(id);
        if (!organization) {
            throw new NotFoundException(`Organization with ID ${id} not found`);
        }
        return { message: 'Organization deleted successfully' };
    }
}