USE [PRP2DEV]
GO

set identity_insert ReviewSubTypes on

INSERT INTO [dbo].[ReviewSubTypes]
           (Id
		   ,[Created]
           ,[CreatedBy]
           ,[Modified]
           ,[ModifiedBy]
           ,[Active]
           ,[Name]
           ,[Description]
           ,[Type])

select *
from [2ComplianceReview]..ReviewSubTypes
