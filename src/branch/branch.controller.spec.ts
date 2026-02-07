import { Test, TestingModule } from '@nestjs/testing';
import { BranchController } from './branch.controller';
import { BranchService } from './branch.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

const mockBranchService = {
    create: jest.fn().mockResolvedValue({ _id: '123' }),
    findAll: jest.fn().mockResolvedValue([{ _id: '123' }]),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    isBranchCodeExist: jest.fn(),
};

describe('BranchController', () => {
    let controller: BranchController;
    let service: BranchService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [BranchController],
            providers: [
                {
                    provide: BranchService,
                    useValue: mockBranchService,
                },
            ],
        }).compile();

        controller = module.get<BranchController>(BranchController);
        service = module.get<BranchService>(BranchService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should create a branch if code does not exist', async () => {
            const dto: any = { code: 'BR001' };
            mockBranchService.isBranchCodeExist.mockResolvedValue(null);
            
            const result = await controller.create(dto);
            expect(result).toBeDefined();
            expect(service.create).toHaveBeenCalledWith(dto);
        });

        it('should throw ConflictException if code exists', async () => {
            const dto: any = { code: 'BR001' };
            mockBranchService.isBranchCodeExist.mockResolvedValue({ _id: 'exists' });
            
            await expect(controller.create(dto)).rejects.toThrow(ConflictException);
        });
    });

    describe('findOne', () => {
        it('should return branch if found', async () => {
            mockBranchService.findOne.mockResolvedValue({ _id: '123' });
            const result = await controller.findOne('123');
            expect(result).toEqual({ _id: '123' });
        });

        it('should throw NotFoundException if not found', async () => {
            mockBranchService.findOne.mockResolvedValue(null);
            await expect(controller.findOne('123')).rejects.toThrow(NotFoundException);
        });
    });
});
