USE [PRP2DEV]
GO
/****** Object:  StoredProcedure [dbo].[MigrateDataFromPRP1]    Script Date: 1/20/2020 12:05:07 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[MigrateDataFromPRP1] 
AS
BEGIN
	SET NOCOUNT ON;

	declare @t table
	(
		QuestionBankId int not null unique
	)

	insert into @t 
		select max(a.QuestionBankId)
		from [cv-sql2].[ComplianceReview].[CPBCInspection].[QuestionBank] a
		join [cv-sql2].[ComplianceReview].[CPBCInspection].[QuestionSet] b on a.QuestionBankId = b.QuestionBankId
		join [cv-sql2].[ComplianceReview].[CPBCInspection].[QuestionSetName] c on b.QuestionNameId = c.QuestionNameId
		where 
			a.ItemNumber is not null and isnull(a.InUse,0) = 1 and isnull(a.Deactivate,0) = 0 and isnull(b.included,0) = 1 and 
			c.QuestionSetName in ('PPPR_Counselling','PPPR_Documentation','PPPR_Identification',
				'PPPR_PharmaNet','TPPR_Collab','TPPR_Documentation','TPPR_Identification',
				'TPPR_ProductDist')
		group by 
			a.ItemNumber


	delete from NonComplianceItem;
	delete from Items;



	insert into Items 
           ([Created]
           ,[CreatedBy]
           ,[Modified]
           ,[ModifiedBy]
           ,[Active]
           ,[Text]
           ,[Legislation]
           ,[LegislationHyperlink]
           ,[IsMaster]
           ,[RequireResponse]
           ,[Notes]
           ,[MasterId]
           ,[Status]
           ,[Version]
           ,[Order])
		select 
				GetDate(),
				a.ItemNumber, -- temporary CreatedBy -> ItemNumber
				null,
				a.MasterItemNumber, -- temporary ModifiedBy -> MasterItemNumber
				1,
				a.QuestionText,
				a.LegislationText,
				a.LegislationHyperlink,
				0,
				a.ToBeAnswered,

				stuff((
					select N', ' + Section 
					from [cv-sql2].[ComplianceReview].[CPBCInspection].[QuestionSet] x
					where 
						x.QuestionBankId = a.QuestionBankId
					order by 
						Section
					for xml path(N'')								
				), 1, 2, N''), -- Notes contains concatenated sections

				null,
				0, -- Status
				a.QuestionBankId, -- Version TODOSC: put an actual version here
				null
		from [cv-sql2].[ComplianceReview].[CPBCInspection].[QuestionBank] a
		join @t b on a.QuestionBankId = b.QuestionBankId;

	update Items set
		MasterId = a.MasterId
	from 
	(
		select a.Id as DetailId, b.Id as MasterId
		from Items a 
		join Items b on a.ModifiedBy = b.CreatedBy
		where
			a.CreatedBy != a.ModifiedBy 
	) a
	where
		Items.Id = a.DetailId;

	update Items set
		IsMaster = 1
    where
        exists (select null from Items a where a.MasterId = Items.Id)

	INSERT INTO NonComplianceItem
           ([Created]
           ,[CreatedBy]
           ,[Modified]
           ,[ModifiedBy]
           ,[Active]
           ,[Text]
           ,[Comment]
           ,[ItemId]
           ,[ActionItem]
           ,[Order])
     select
		   GetDate(),
           null,
           null,
           null,
           1,
           a.NonComplianceText,
           null,
           b.Id,
           a.ActionItemText,
           null
		from [cv-sql2].[ComplianceReview].[CPBCInspection].[QuestionNCActionEvidence] a 
		join
		(
			select
				NonComplianceText,
				ActionItemText,
				max(QNCAEID) as MaxQNCAEID
			from [cv-sql2].[ComplianceReview].[CPBCInspection].[QuestionNCActionEvidence]
			where
				InUse = 1 and isnull(disable,0) = 0 and isnull(Deleted,0) = 0 
			group by 			
				NonComplianceText,
				ActionItemText
		) c on a.QNCAEID = c.MaxQNCAEID
		join Items b on a.ItemBankNumber = b.CreatedBy

	update Items set
		CreatedBy = null,
		ModifiedBy = null;

END


