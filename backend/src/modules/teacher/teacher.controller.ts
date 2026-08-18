import { Controller, Get, Post, Patch, Delete, Param, Body, Query, Request } from '@nestjs/common';
import { TeacherService } from './teacher.service';

@Controller('teachers')
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('department') department?: string,
    @Request() req?: any,
  ) {
    const tenantId = req?.user?.tenantId || 'tenant-test-001';
    return this.teacherService.findAll(tenantId, { search, role, department });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    const tenantId = req?.user?.tenantId || 'tenant-test-001';
    return this.teacherService.findOne(id, tenantId);
  }

  @Post()
  create(@Body() createDto: any, @Request() req) {
    const tenantId = req?.user?.tenantId || 'tenant-test-001';
    return this.teacherService.create(tenantId, createDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: any, @Request() req) {
    const tenantId = req?.user?.tenantId || 'tenant-test-001';
    return this.teacherService.update(id, tenantId, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    const tenantId = req?.user?.tenantId || 'tenant-test-001';
    return this.teacherService.remove(id, tenantId);
  }
}
